#include <sourcemeta/core/editorschema.h>
#include <sourcemeta/core/io.h>
#include <sourcemeta/core/json.h>
#include <sourcemeta/core/jsonschema.h>
#include <sourcemeta/core/yaml.h>

#include <iostream> // std::cout

#include "command.h"
#include "configuration.h"
#include "error.h"
#include "logger.h"
#include "resolver.h"
#include "utils.h"

auto sourcemeta::jsonschema::bundle(const sourcemeta::core::Options &options)
    -> void {

  if (options.positional().size() < 1) {
    throw PositionalArgumentError{"This command expects a path to a schema",
                                  "jsonschema bundle path/to/schema.json"};
  }

  const std::filesystem::path schema_path{options.positional().front()};
  const auto configuration_path{find_configuration(schema_path)};
  const auto &configuration{read_configuration(options, configuration_path)};
  const auto dialect{default_dialect(options, configuration)};
  const auto &custom_resolver{
      resolver(options, options.contains("http"), dialect, configuration)};
  auto schema{sourcemeta::core::read_yaml_or_json(schema_path)};

  sourcemeta::core::bundle(schema, sourcemeta::core::schema_official_walker,
                           custom_resolver, dialect,
                           sourcemeta::core::URI::from_path(
                               sourcemeta::core::weakly_canonical(schema_path))
                               .recompose());

  if (options.contains("without-id")) {
    // Using LOG_WARNING for some messages
    std::cerr << "You are opting in to remove schema identifiers.\n";
    std::cerr << "The only legit use case is to workaround non-compliant "
                 "implementations.\n";
    sourcemeta::core::for_editor(schema,
                                 sourcemeta::core::schema_official_walker,
                                 custom_resolver, dialect);
  }

  sourcemeta::core::prettify(schema, std::cout,
                             sourcemeta::core::schema_format_compare);
  std::cout << "\n";
}
