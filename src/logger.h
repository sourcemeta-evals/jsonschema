#ifndef SOURCEMETA_JSONSCHEMA_CLI_LOGGER_H_
#define SOURCEMETA_JSONSCHEMA_CLI_LOGGER_H_

#include <sourcemeta/core/options.h>

#include <fstream>  // std::ofstream
#include <iostream> // std::cerr
#include <ostream>  // std::ostream

namespace sourcemeta::jsonschema {

inline auto LOG_VERBOSE(const sourcemeta::core::Options &options)
    -> std::ostream & {
  if (options.contains("verbose")) {
    return std::cerr;
  }

  static std::ofstream null_stream;
  return null_stream;
}

inline auto LOG_WARNING() -> std::ostream & {
  // Return null stream to suppress warnings by default
  static std::ofstream null_stream;
  return null_stream;
}

} // namespace sourcemeta::jsonschema

#endif
