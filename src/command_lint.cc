#include <sourcemeta/core/alterschema.h>
#include <sourcemeta/core/json.h>
#include <sourcemeta/core/jsonpointer.h>
#include <sourcemeta/core/jsonschema.h>

#include <sourcemeta/blaze/linter.h>

#include <cstdlib>  // EXIT_SUCCESS, EXIT_FAILURE
#include <fstream>  // std::ofstream
#include <iostream> // std::cerr, std::cout
#include <sstream>  // std::ostringstream

#include "command.h"
#include "utils.h"

template <typename Options, typename Iterator>
static auto disable_lint_rules(sourcemeta::core::SchemaTransformer &bundle,
                               const Options &options, Iterator first,
                               Iterator last, bool show_warnings = true)
    -> void {
  for (auto iterator = first; iterator != last; ++iterator) {
    if (bundle.remove(*iterator)) {
      if (show_warnings) {
        sourcemeta::jsonschema::cli::log_verbose(options)
            << "Disabling rule: " << *iterator << "\n";
      }
    } else {
      if (show_warnings) {
        sourcemeta::jsonschema::cli::log_verbose(options)
            << "warning: Cannot exclude unknown rule: " << *iterator << "\n";
      }
    }
  }
}

static auto reindent(const std::string_view &value,
                     const std::string &indentation, std::ostream &stream)
    -> void {
  if (!value.empty()) {
    stream << indentation;
  }

  for (std::size_t index = 0; index < value.size(); index++) {
    const auto character{value[index]};
    stream.put(character);
    if (character == '\n' && index != value.size() - 1) {
      stream << indentation;
    }
  }
}

static auto get_lint_callback(sourcemeta::core::JSON &errors_array,
                              const std::filesystem::path &path,
                              const bool output_json) -> auto {
  return [&path, &errors_array,
          output_json](const auto &pointer, const auto &name,
                       const auto &message, const auto &description) {
    if (output_json) {
      auto error_obj = sourcemeta::core::JSON::make_object();

      error_obj.assign("path", sourcemeta::core::JSON{path.string()});
      error_obj.assign("id", sourcemeta::core::JSON{name});
      error_obj.assign("message", sourcemeta::core::JSON{message});

      if (description.empty()) {
        error_obj.assign("description", sourcemeta::core::JSON{nullptr});
      } else {
        error_obj.assign("description", sourcemeta::core::JSON{message});
      }

      std::ostringstream pointer_stream;
      sourcemeta::core::stringify(pointer, pointer_stream);
      error_obj.assign("schemaLocation",
                       sourcemeta::core::JSON{pointer_stream.str()});

      errors_array.push_back(error_obj);
    } else {
      std::cout << path.string() << ":\n";
      std::cout << "  " << message << " (" << name << ")\n";
      std::cout << "    at schema location \"";
      sourcemeta::core::stringify(pointer, std::cout);
      std::cout << "\"\n";
      if (!description.empty()) {
        reindent(description, "    ", std::cout);
        if (description.back() != '\n') {
          std::cout << "\n";
        }
      }
    }
  };
}

auto sourcemeta::jsonschema::cli::lint(
    const std::span<const std::string> &arguments) -> int {
  const auto options{
      parse_options(arguments, {"f", "fix", "json", "j", "l", "list"})};
  const bool output_json = options.contains("json") || options.contains("j");

  sourcemeta::core::SchemaTransformer lint_bundle;
  sourcemeta::core::SchemaTransformer readability_bundle;
  sourcemeta::core::add(readability_bundle,
                        sourcemeta::core::AlterSchemaMode::Readability);

  lint_bundle.add<sourcemeta::blaze::ValidExamples>(
      sourcemeta::blaze::default_schema_compiler);
  lint_bundle.add<sourcemeta::blaze::ValidDefault>(
      sourcemeta::blaze::default_schema_compiler);

  if (options.contains("exclude")) {
    for (auto iterator = options.at("exclude").cbegin();
         iterator != options.at("exclude").cend(); ++iterator) {
      const bool removed_from_lint = lint_bundle.remove(*iterator);
      const bool removed_from_readability =
          readability_bundle.remove(*iterator);
      if (removed_from_lint || removed_from_readability) {
        sourcemeta::jsonschema::cli::log_verbose(options)
            << "Disabling rule: " << *iterator << "\n";
      } else {
        sourcemeta::jsonschema::cli::log_verbose(options)
            << "warning: Cannot exclude unknown rule: " << *iterator << "\n";
      }
    }
  }

  if (options.contains("x")) {
    for (auto iterator = options.at("x").cbegin();
         iterator != options.at("x").cend(); ++iterator) {
      const bool removed_from_lint = lint_bundle.remove(*iterator);
      const bool removed_from_readability =
          readability_bundle.remove(*iterator);
      if (removed_from_lint || removed_from_readability) {
        sourcemeta::jsonschema::cli::log_verbose(options)
            << "Disabling rule: " << *iterator << "\n";
      } else {
        sourcemeta::jsonschema::cli::log_verbose(options)
            << "warning: Cannot exclude unknown rule: " << *iterator << "\n";
      }
    }
  }

  if (options.contains("list") || options.contains("l")) {
    std::vector<std::pair<std::reference_wrapper<const std::string>,
                          std::reference_wrapper<const std::string>>>
        rules;
    for (const auto &entry : lint_bundle) {
      rules.emplace_back(entry.first, entry.second->message());
    }
    for (const auto &entry : readability_bundle) {
      rules.emplace_back(entry.first, entry.second->message());
    }

    std::sort(rules.begin(), rules.end(),
              [](const auto &left, const auto &right) {
                return left.first.get() < right.first.get() ||
                       (left.first.get() == right.first.get() &&
                        left.second.get() < right.second.get());
              });

    std::size_t count{0};
    for (const auto &entry : rules) {
      std::cout << entry.first.get() << "\n";
      std::cout << "  " << entry.second.get() << "\n\n";
      count += 1;
    }

    std::cout << "Number of rules: " << count << "\n";
    return EXIT_SUCCESS;
  }

  bool result{true};
  auto errors_array = sourcemeta::core::JSON::make_array();
  const auto dialect{default_dialect(options)};

  if (options.contains("f") || options.contains("fix")) {
    for (const auto &entry :
         for_each_json(options.at(""), parse_ignore(options),
                       parse_extensions(options))) {
      log_verbose(options) << "Linting: " << entry.first.string() << "\n";
      if (entry.first.extension() == ".yaml" ||
          entry.first.extension() == ".yml") {
        std::cerr << "The --fix option is not supported for YAML input files\n";
        return EXIT_FAILURE;
      }

      auto copy = entry.second;

      try {
        auto original_copy = copy;
        lint_bundle.apply(
            copy, sourcemeta::core::schema_official_walker,
            resolver(options, options.contains("h") || options.contains("http"),
                     dialect),
            get_lint_callback(errors_array, entry.first, output_json), dialect,
            sourcemeta::core::URI::from_path(entry.first).recompose());
        const bool lint_changes_applied = (copy != original_copy);

        auto copy_after_lint = copy;
        readability_bundle.apply(
            copy, sourcemeta::core::schema_official_walker,
            resolver(options, options.contains("h") || options.contains("http"),
                     dialect),
            get_lint_callback(errors_array, entry.first, output_json), dialect,
            sourcemeta::core::URI::from_path(entry.first).recompose());
        const bool readability_changes_applied = (copy != copy_after_lint);

        // Only write the file if either lint or readability rules made changes
        if (lint_changes_applied || readability_changes_applied) {
          std::ofstream output{entry.first};
          sourcemeta::core::prettify(copy, output);
          output << "\n";
        }
      } catch (const sourcemeta::core::SchemaUnknownBaseDialectError &) {
        throw FileError<sourcemeta::core::SchemaUnknownBaseDialectError>(
            entry.first);
      }
    }
  } else {
    for (const auto &entry :
         for_each_json(options.at(""), parse_ignore(options),
                       parse_extensions(options))) {
      log_verbose(options) << "Linting: " << entry.first.string() << "\n";
      try {
        const bool lint_result = lint_bundle.check(
            entry.second, sourcemeta::core::schema_official_walker,
            resolver(options, options.contains("h") || options.contains("http"),
                     dialect),
            get_lint_callback(errors_array, entry.first, output_json), dialect,
            sourcemeta::core::URI::from_path(entry.first).recompose());
        const bool readability_result = readability_bundle.check(
            entry.second, sourcemeta::core::schema_official_walker,
            resolver(options, options.contains("h") || options.contains("http"),
                     dialect),
            get_lint_callback(errors_array, entry.first, output_json), dialect,
            sourcemeta::core::URI::from_path(entry.first).recompose());
        const bool subresult = lint_result && readability_result;
        if (!subresult) {
          result = false;
        }
      } catch (const sourcemeta::core::SchemaUnknownBaseDialectError &) {
        throw FileError<sourcemeta::core::SchemaUnknownBaseDialectError>(
            entry.first);
      }
    }
  }

  if (output_json) {
    auto output_json_object = sourcemeta::core::JSON::make_object();
    output_json_object.assign("valid", sourcemeta::core::JSON{result});
    output_json_object.assign("errors", sourcemeta::core::JSON{errors_array});
    sourcemeta::core::prettify(output_json_object, std::cout);
    std::cout << "\n";
  }

  return result ? EXIT_SUCCESS : EXIT_FAILURE;
}
