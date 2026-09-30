#ifndef SOURCEMETA_JSONSCHEMA_CLI_RESOLVER_H_
#define SOURCEMETA_JSONSCHEMA_CLI_RESOLVER_H_

#include <sourcemeta/blaze/configuration.h>
#include <sourcemeta/blaze/foundation.h>
#include <sourcemeta/core/http.h>
#include <sourcemeta/core/io.h>
#include <sourcemeta/core/json.h>
#include <sourcemeta/core/options.h>
#include <sourcemeta/core/uri.h>
#include <sourcemeta/core/yaml.h>

#include "error.h"
#include "input.h"
#include "logger.h"
#include "utils.h"

#include <cassert> // assert
#include <chrono>  // std::chrono::seconds
#include <cstddef> // std::size_t
#include <cstdint> // std::uint8_t
#include <exception> // std::exception_ptr, std::current_exception, std::rethrow_exception
#include <filesystem>  // std::filesystem
#include <functional>  // std::function, std::ref
#include <iostream>    // std::cerr
#include <map>         // std::map
#include <optional>    // std::optional
#include <set>         // std::set
#include <string>      // std::string
#include <string_view> // std::string_view
#include <thread>      // std::this_thread::sleep_for
#include <utility> // std::pair, std::piecewise_construct, std::forward_as_tuple
#include <vector>  // std::vector

namespace sourcemeta::jsonschema {

static constexpr std::uint8_t HTTP_MAXIMUM_RETRIES{3};

static inline auto find_resolve_match(
    const std::unordered_map<std::string, std::string> &resolve_map,
    const std::string &identifier)
    -> std::unordered_map<std::string, std::string>::const_iterator {
  auto match{resolve_map.find(identifier)};
  if (match == resolve_map.cend() && !identifier.ends_with(".json")) {
    match = resolve_map.find(identifier + ".json");
  }
  if (match == resolve_map.cend() && identifier.ends_with(".json")) {
    match = resolve_map.find(identifier.substr(0, identifier.size() - 5));
  }
  return match;
}

static inline auto
resolve_map_uri(const sourcemeta::blaze::Configuration &configuration,
                const std::string &identifier) -> std::optional<std::string> {
  const auto match{find_resolve_match(configuration.resolve, identifier)};
  if (match == configuration.resolve.cend()) {
    return std::nullopt;
  }

  return resolve_relative_uri(match->second, configuration.base_path);
}

static constexpr std::string_view HTTP_HEADER_EXAMPLE{
    "--header \"Authorization: Bearer ${TOKEN}\""};

static inline auto parse_http_header(const std::string_view input)
    -> std::pair<std::string_view, std::string_view> {
  const auto colon{input.find(':')};
  if (colon == std::string_view::npos) {
    throw PositionalArgumentError{
        "HTTP headers must be in the form `Name: Value`",
        std::string{HTTP_HEADER_EXAMPLE}};
  }

  const auto raw_name{input.substr(0, colon)};
  if (raw_name.empty()) {
    throw PositionalArgumentError{"HTTP header names cannot be empty",
                                  std::string{HTTP_HEADER_EXAMPLE}};
  }

  for (const auto character : raw_name) {
    if (character == ' ' || character == '\t') {
      throw PositionalArgumentError{
          "HTTP header names cannot contain whitespace",
          std::string{HTTP_HEADER_EXAMPLE}};
    }
    if (static_cast<unsigned char>(character) < 0x20 ||
        static_cast<unsigned char>(character) == 0x7F) {
      throw PositionalArgumentError{
          "HTTP header names cannot contain control characters",
          std::string{HTTP_HEADER_EXAMPLE}};
    }
  }

  auto raw_value{input.substr(colon + 1)};
  while (!raw_value.empty() &&
         (raw_value.front() == ' ' || raw_value.front() == '\t')) {
    raw_value.remove_prefix(1);
  }

  for (const auto character : raw_value) {
    if (character == '\r' || character == '\n' || character == '\0') {
      throw PositionalArgumentError{
          "HTTP header values cannot contain control characters",
          std::string{HTTP_HEADER_EXAMPLE}};
    }
  }

  return {raw_name, raw_value};
}

static inline auto
validate_http_headers(const sourcemeta::core::Options &options) -> void {
  if (!options.contains("header")) {
    return;
  }
  for (const auto &raw : options.at("header")) {
    parse_http_header(raw);
  }
}

static inline auto
collect_http_headers(const sourcemeta::core::Options &options)
    -> std::vector<std::pair<std::string_view, std::string_view>> {
  std::vector<std::pair<std::string_view, std::string_view>> headers;
  if (!options.contains("header")) {
    return headers;
  }
  for (const auto &raw : options.at("header")) {
    headers.emplace_back(parse_http_header(raw));
  }
  return headers;
}

static inline auto http_fetch(const std::string &url,
                              const sourcemeta::core::Options &options)
    -> sourcemeta::core::JSON {
  sourcemeta::core::HTTPSystemRequest request{url};
  for (const auto &header : collect_http_headers(options)) {
    request.header(std::string{header.first}, std::string{header.second});
  }

  sourcemeta::core::HTTPResponse response;
  for (std::uint8_t attempt{1}; attempt <= HTTP_MAXIMUM_RETRIES; ++attempt) {
    LOG_VERBOSE(options) << "Resolving over HTTP (attempt "
                         << static_cast<int>(attempt) << "/"
                         << static_cast<int>(HTTP_MAXIMUM_RETRIES)
                         << "): " << url << "\n";
    try {
      response = request.send();
    } catch (const sourcemeta::core::HTTPError &error) {
      if (attempt == HTTP_MAXIMUM_RETRIES) {
        throw;
      }

      LOG_VERBOSE(options) << "Request failed (" << error.what()
                           << "), retrying...\n";
      std::this_thread::sleep_for(std::chrono::seconds(1));
      continue;
    }

    if (response.status == sourcemeta::core::HTTP_STATUS_OK) {
      break;
    }

    if (attempt < HTTP_MAXIMUM_RETRIES) {
      LOG_VERBOSE(options) << "Request failed with HTTP "
                           << response.status.code << ", retrying...\n";
      std::this_thread::sleep_for(std::chrono::seconds(1));
    }
  }

  if (response.status != sourcemeta::core::HTTP_STATUS_OK) {
    throw sourcemeta::core::HTTPStatusError{sourcemeta::core::HTTPMethod::GET,
                                            url, response.status};
  }

  const auto content_type{
      sourcemeta::core::http_header_find(response.headers, "content-type")};
  if (content_type.has_value() && sourcemeta::core::http_content_type_matches(
                                      content_type.value(), "text/yaml")) {
    try {
      return sourcemeta::core::parse_yaml(response.body);
    } catch (const sourcemeta::core::YAMLParseError &error) {
      throw sourcemeta::core::YAMLFileParseError{url, error};
    }
  }

  return sourcemeta::core::parse_json(response.body);
}

static inline auto fetch_schema(const sourcemeta::core::Options &options,
                                std::string_view identifier,
                                const bool remote = true,
                                const bool bundle = false)
    -> std::optional<sourcemeta::core::JSON> {
  auto official_result{sourcemeta::blaze::schema_resolver(identifier)};
  if (official_result.has_value()) {
    return official_result;
  }

  sourcemeta::core::URI uri;
  try {
    uri = sourcemeta::core::URI{identifier};
  } catch (const sourcemeta::core::URIParseError &) {
    return std::nullopt;
  }

  if (uri.is_file()) {
    const auto path{uri.to_path()};
    LOG_DEBUG(options) << "Attempting to read file reference from disk: "
                       << path.generic_string() << "\n";
    if (std::filesystem::exists(path)) {
      return sourcemeta::core::read_yaml_or_json(path);
    }

    return std::nullopt;
  }

  if (remote) {
    const auto scheme{uri.scheme()};
    if (!uri.is_urn() && scheme.has_value() &&
        (scheme.value() == "https" || scheme.value() == "http")) {
      std::string fetch_url{identifier};
      if (bundle) {
        // TODO: Use sourcemeta::core::URI to set query parameters once
        // the URI module supports setters for query strings
        if (fetch_url.find('?') != std::string::npos) {
          fetch_url += "&bundle=1";
        } else {
          fetch_url += "?bundle=1";
        }
      }

      return http_fetch(fetch_url, options);
    }
  }

  return std::nullopt;
}

// Different spellings of the same URI (empty fragment, default port,
// mixed case) must resolve to the same identifier or the resolver
// starts fetching pending local roots and missing completed imports.
// Canonicalize once, on both the storage and the lookup side, so the
// two sides agree
static inline auto canonicalize_identifier(const std::string_view identifier)
    -> std::string {
  try {
    sourcemeta::core::URI uri{std::string{identifier}};
    uri.canonicalize();
    auto recomposed{uri.recompose()};
    if (!recomposed.empty() && recomposed.back() == '#') {
      recomposed.pop_back();
    }
    return recomposed;
  } catch (const sourcemeta::core::URIParseError &) {
    return std::string{identifier};
  }
}

static inline auto
ensure_identifier(sourcemeta::core::JSON &schema, const std::string_view target,
                  const sourcemeta::blaze::SchemaResolver &resolver) -> void {
  if (!schema.is_object()) {
    return;
  }

  sourcemeta::blaze::SchemaFrame frame{
      sourcemeta::blaze::SchemaFrame::Mode::Root};

  try {
    frame.analyse(schema, sourcemeta::blaze::schema_walker, resolver);
  } catch (const sourcemeta::blaze::SchemaUnknownBaseDialectError &) {
    return;
  }

  if (!frame.root().empty()) {
    return;
  }

  const auto location{frame.root_location()};
  if (!location.has_value()) {
    return;
  }

  sourcemeta::blaze::schema_reidentify(schema, target,
                                       location.value().get().base_dialect);
}

class CustomResolver {
public:
  CustomResolver(
      const sourcemeta::core::Options &options,
      const std::optional<sourcemeta::blaze::Configuration> &configuration,
      const bool remote, const std::string_view default_dialect)
      : options_{options}, configuration_{configuration}, remote_{remote} {
    if (options.contains("resolve")) {
      const auto entries{for_each_json(options.at("resolve"), options)};
      std::vector<std::size_t> pending;
      pending.reserve(entries.size());
      for (std::size_t index = 0; index < entries.size(); index++) {
        pending.push_back(index);
      }

      // Importing a schema requires resolving its meta-schema, which may well
      // be another one of the schemas that the user is importing. Rather than
      // forcing the user to declare their files in dependency order, keep
      // retrying the ones that cannot resolve yet for as long as every pass
      // manages to import at least one more schema. Keep remote fetching
      // disabled while the locally provided schemas can make progress, so
      // that a schema imported before the local file that declares its
      // meta-schema resolves against that local file instead of triggering
      // a network fetch for it
      const auto allow_remote{this->remote_};
      this->remote_ = false;
      while (!pending.empty()) {
        std::vector<std::size_t> deferred;
        std::exception_ptr failure;
        bool made_progress{false};

        for (const auto index : pending) {
          try {
            this->import_entry(entries[index], default_dialect);
            made_progress = true;
          } catch (const sourcemeta::core::FileError<
                   sourcemeta::blaze::SchemaResolutionError> &) {
            if (!failure) {
              failure = std::current_exception();
            }

            LOG_DEBUG(options)
                << "Deferring import until the remaining schemas are "
                   "imported: "
                << entries[index].first << "\n";
            deferred.push_back(index);

            // Full framing needs every meta-schema resolved up front,
            // yet registering just the root only needs the root's own
            // dialect chain to terminate in something already known.
            // Attempt that as a partial step so a later pass can
            // complete framings that name this entry, which turns a
            // finite chain of locally supplied schemas into a
            // resolvable one no matter the argument order
            if (this->register_root(entries[index], default_dialect)) {
              made_progress = true;
            }
          }
        }

        // Nothing can make progress anymore, so report the first failure,
        // which is exactly what the user would have seen if imports were
        // never retried. Note that when several entries remain stuck, the
        // one we report might be waiting on another stuck entry rather than
        // on the schema that is genuinely missing
        if (!made_progress) {
          // Before giving up, let the remaining entries try their remote
          // fallback when the user enabled it
          if (allow_remote && !this->remote_) {
            // Remote fetching must still never shadow a schema that the
            // user supplied locally, so remember what the entries that are
            // still stuck declare before letting the network in. Entries
            // that did get imported are found among the imported schemas
            // before this ever comes into play
            for (const auto index : deferred) {
              this->collect_pending_identifiers(entries[index],
                                                default_dialect);
            }

            this->remote_ = true;
          } else {
            std::rethrow_exception(failure);
          }
        }

        pending = std::move(deferred);
      }

      this->pending_identifiers_.clear();
      this->remote_ = allow_remote;
    }

    if (this->configuration_.has_value()) {
      for (const auto &[dependency_uri, dependency_path] :
           this->configuration_.value().dependencies) {
        if (!std::filesystem::exists(dependency_path)) {
          continue;
        }

        auto schema{sourcemeta::core::read_json(dependency_path)};
        if (!schema.is_object() && !schema.is_boolean()) {
          continue;
        }

        try {
          this->add(schema, default_dialect);
        } catch (...) {
          continue;
        }

        this->schemas.emplace(dependency_uri, schema);
      }
    }
  }

  auto add(const sourcemeta::core::JSON &schema,
           const std::string_view default_dialect = "",
           const std::string_view default_id = "",
           const std::function<void(const sourcemeta::core::JSON::String &)>
               &callback = nullptr,
           const sourcemeta::blaze::SchemaFrame::Mode mode =
               sourcemeta::blaze::SchemaFrame::Mode::References) -> bool {
    assert(schema.is_object() || schema.is_boolean());

    // Framing the whole document is what vets it, from the vocabularies
    // every resource declares to the anchors it collides on, so the
    // analysis stays as wide as the file. What gets registered does not
    sourcemeta::blaze::SchemaFrame frame{mode};
    frame.analyse(schema, sourcemeta::blaze::schema_walker, *this,
                  default_dialect, default_id);

    bool added_any_schema{false};
    for (const auto &[key, entry] : frame.locations()) {
      if (entry.type !=
          sourcemeta::blaze::SchemaFrame::LocationType::Resource) {
        continue;
      }

      // A file stands for the single schema it declares. A resource that
      // the schema merely embeds is reachable from within that schema,
      // and answering for it on its own would hand back a schema that
      // the user never supplied as one
      if (!entry.pointer.empty()) {
        continue;
      }

      auto subschema{sourcemeta::core::get(schema, entry.pointer)};
      const auto subschema_vocabularies{frame.vocabularies(entry, *this)};

      // Given we might be resolving embedded resources, we fully
      // resolve their dialect and identifiers, otherwise the
      // consumer might have no idea what to do with them. A boolean
      // schema carries no keywords, so neither the `$schema` write
      // nor the reidentification is defined on it
      if (subschema.is_object()) {
        subschema.assign("$schema", sourcemeta::core::JSON{entry.dialect});
        sourcemeta::blaze::schema_reidentify(subschema, key.second,
                                             entry.base_dialect);
      }

      const auto canonical_identifier{canonicalize_identifier(key.second)};
      const auto result{this->schemas.emplace(canonical_identifier, subschema)};
      if (!result.second && result.first->second != subschema) {
        throw sourcemeta::blaze::SchemaFrameError(
            key.second, "Cannot register the same identifier twice");
      }

      if (callback) {
        callback(key.second);
      }

      added_any_schema = true;
    }

    return added_any_schema;
  }

  auto operator()(std::string_view identifier) const
      -> std::optional<sourcemeta::core::JSON> {
    const std::string string_identifier{identifier};
    const auto mapped_result = this->configuration_.and_then(
        [&string_identifier](const sourcemeta::blaze::Configuration &config)
            -> std::optional<std::string> {
          return resolve_map_uri(config, string_identifier);
        });
    const std::string &target{mapped_result.has_value() ? mapped_result.value()
                                                        : string_identifier};
    if (mapped_result.has_value()) {
      LOG_DEBUG(this->options_) << "Resolving " << identifier << " as "
                                << target << " given the configuration file\n";
    }

    const auto canonical_target{canonicalize_identifier(target)};

    if (this->schemas.contains(canonical_target)) {
      return this->schemas.at(canonical_target);
    }

    // Suppress even when remote fetching is off, because a
    // configuration alias can map an identifier to a local file
    // whose own frame analysis would call back into the resolver
    // and read the same document again without terminating
    if (this->pending_identifiers_.contains(canonical_target)) {
      return std::nullopt;
    }

    // Reserve the target while its document is being fetched and
    // framed so any recursive lookup for the same identifier short
    // circuits instead of walking the same cycle again
    const auto reserved{
        this->pending_identifiers_.insert(canonical_target).second};
    std::optional<sourcemeta::core::JSON> fetched;
    try {
      fetched = fetch_schema(this->options_, target, this->remote_);
      if (fetched.has_value()) {
        ensure_identifier(fetched.value(), string_identifier, *this);
      }
    } catch (...) {
      if (reserved) {
        this->pending_identifiers_.erase(canonical_target);
      }
      throw;
    }
    if (reserved) {
      this->pending_identifiers_.erase(canonical_target);
    }

    return fetched;
  }

private:
  // A finite chain of locally supplied schemas whose meta-schemas
  // eventually terminate in a known base dialect can resolve without
  // the network even when a single-pass full framing cannot, because
  // full framing needs every embedded resource's meta-schema known
  // up front while a root registration only needs the root's own
  // dialect chain to terminate in something already known. Frame the
  // top schema alone and register its root resource so that a later
  // pass can complete framings that name this entry as their meta
  auto register_root(const InputJSON &entry,
                     const std::string_view default_dialect) -> bool {
    if (!entry.second.is_object() && !entry.second.is_boolean()) {
      return false;
    }

    try {
      const auto size_before{this->schemas.size()};
      this->add(entry.second, default_dialect,
                sourcemeta::jsonschema::default_id(entry), nullptr,
                sourcemeta::blaze::SchemaFrame::Mode::Root);
      return this->schemas.size() > size_before;
    } catch (const sourcemeta::blaze::SchemaResolutionError &) {
      // The root's own dialect chain terminates in an entry still
      // pending on this pass, so try again once more roots have been
      // registered
      return false;
    }
  }

  // Framing a schema reveals the identifiers it declares, but framing
  // needs its meta-schema resolved first, which is precisely what an
  // entry that cannot be imported is missing. Ask the library for the
  // root claim instead: framing the top schema alone stays clear of
  // embedded resources, so an unresolvable meta-schema deeper in the
  // document does not stop us from learning which keyword its dialect
  // names as the identifier. When the root's own dialect chain also
  // terminates in an entry still pending on this pass, fall back to
  // whichever of the two keywords the entry spells at its root, since
  // either one might turn out to be the legitimate claim once the
  // dialect finally resolves
  auto collect_pending_identifiers(const InputJSON &entry,
                                   const std::string_view default_dialect)
      -> void {
    const auto default_id{sourcemeta::jsonschema::default_id(entry)};
    this->pending_identifiers_.insert(canonicalize_identifier(default_id));

    if (!entry.second.is_object()) {
      return;
    }

    try {
      sourcemeta::blaze::SchemaFrame frame{
          sourcemeta::blaze::SchemaFrame::Mode::Root};
      frame.analyse(entry.second, sourcemeta::blaze::schema_walker, *this,
                    default_dialect, default_id);
      for (const auto &[key, location] : frame.locations()) {
        if (location.type !=
                sourcemeta::blaze::SchemaFrame::LocationType::Resource ||
            !location.pointer.empty()) {
          continue;
        }

        this->pending_identifiers_.insert(canonicalize_identifier(key.second));
      }
      return;
    } catch (...) {
      // Fall through to the syntactic scan
    }

    for (const auto &keyword : {"$id", "id"}) {
      const auto *identifier{entry.second.try_at(keyword)};
      if (identifier == nullptr || !identifier->is_string()) {
        continue;
      }

      const auto &identifier_string{identifier->to_string()};
      this->pending_identifiers_.insert(
          canonicalize_identifier(identifier_string));
      if (!default_id.empty()) {
        try {
          sourcemeta::core::URI uri{identifier_string};
          uri.resolve_from(sourcemeta::core::URI{default_id});
          this->pending_identifiers_.insert(
              canonicalize_identifier(uri.recompose()));
        } catch (const sourcemeta::core::URIParseError &) {
          // An identifier that cannot be parsed as a URI can never
          // become a resolution target either
        }
      }
    }
  }

  auto import_entry(const InputJSON &entry,
                    const std::string_view default_dialect) -> void {
    LOG_DEBUG(this->options_)
        << "Detecting schema resources from file: " << entry.first << "\n";

    if (!entry.second.is_object() && !entry.second.is_boolean()) {
      throw sourcemeta::core::FileError<sourcemeta::blaze::SchemaError>(
          entry.resolution_base,
          "The file you provided does not represent a valid JSON Schema");
    }

    try {
      const auto result =
          this->add(entry.second, default_dialect,
                    sourcemeta::jsonschema::default_id(entry),
                    [this](const auto &identifier) {
                      LOG_DEBUG(this->options_)
                          << "Importing schema into the resolution context: "
                          << identifier << "\n";
                    });
      if (!result) {
        LOG_WARNING() << "No schema resources were imported from this file\n"
                      << "  at " << entry.first << "\n"
                      << "Are you sure this schema sets any identifiers?\n";
      }
    } catch (const sourcemeta::blaze::SchemaKeywordError &error) {
      throw sourcemeta::core::FileError<sourcemeta::blaze::SchemaKeywordError>(
          entry.resolution_base, error);
    } catch (const sourcemeta::blaze::SchemaFrameError &error) {
      throw sourcemeta::core::FileError<sourcemeta::blaze::SchemaFrameError>(
          entry.resolution_base, error.identifier(), error.what());
    } catch (const sourcemeta::blaze::SchemaAnchorCollisionError &error) {
      const auto position{entry.positions.get(error.location())};
      if (position.has_value()) {
        throw PositionError<sourcemeta::core::FileError<
            sourcemeta::blaze::SchemaAnchorCollisionError>>(
            std::get<0>(position.value()), std::get<1>(position.value()),
            entry.resolution_base, error);
      }

      throw sourcemeta::core::FileError<
          sourcemeta::blaze::SchemaAnchorCollisionError>(entry.resolution_base,
                                                         error);
    } catch (const sourcemeta::blaze::SchemaReferenceError &error) {
      throw sourcemeta::core::FileError<
          sourcemeta::blaze::SchemaReferenceError>(
          entry.resolution_base, error.identifier(), error.location(),
          error.what());
    } catch (const sourcemeta::blaze::SchemaUnknownBaseDialectError &) {
      throw sourcemeta::core::FileError<
          sourcemeta::blaze::SchemaUnknownBaseDialectError>(
          entry.resolution_base);
    } catch (const sourcemeta::blaze::SchemaUnknownDialectError &) {
      throw sourcemeta::core::FileError<
          sourcemeta::blaze::SchemaUnknownDialectError>(entry.resolution_base);
    } catch (const sourcemeta::blaze::SchemaRelativeMetaschemaResolutionError
                 &error) {
      throw sourcemeta::core::FileError<
          sourcemeta::blaze::SchemaRelativeMetaschemaResolutionError>(
          entry.resolution_base, error);
    } catch (const sourcemeta::blaze::SchemaResolutionError &error) {
      throw sourcemeta::core::FileError<
          sourcemeta::blaze::SchemaResolutionError>(
          entry.resolution_base, error.identifier(), error.what());
    } catch (const sourcemeta::blaze::SchemaError &error) {
      throw sourcemeta::core::FileError<sourcemeta::blaze::SchemaError>(
          entry.resolution_base, error.what());
    }
  }

  std::map<std::string, sourcemeta::core::JSON> schemas{};
  const sourcemeta::core::Options &options_;
  const std::optional<sourcemeta::blaze::Configuration> configuration_;
  bool remote_{false};
  mutable std::set<std::string> pending_identifiers_{};
};

inline auto
resolver(const sourcemeta::core::Options &options, const bool remote,
         const std::string_view default_dialect,
         const std::optional<sourcemeta::blaze::Configuration> &configuration)
    -> const CustomResolver & {
  using CacheKey = std::pair<bool, std::string>;
  static std::map<CacheKey, CustomResolver> resolver_cache;
  const CacheKey cache_key{remote, std::string{default_dialect}};

  // Check if resolver is already cached
  auto iterator{resolver_cache.find(cache_key)};
  if (iterator != resolver_cache.end()) {
    return iterator->second;
  }

  // Construct resolver directly in cache
  auto [inserted_iterator, inserted] = resolver_cache.emplace(
      std::piecewise_construct, std::forward_as_tuple(cache_key),
      std::forward_as_tuple(options, configuration, remote, default_dialect));
  return inserted_iterator->second;
}

} // namespace sourcemeta::jsonschema

#endif
