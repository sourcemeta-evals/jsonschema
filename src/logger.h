#ifndef SOURCEMETA_JSONSCHEMA_CLI_LOGGER_H_
#define SOURCEMETA_JSONSCHEMA_CLI_LOGGER_H_

#include <sourcemeta/core/options.h>

#include <fstream> // std::ofstream
#include <iostream>
#include <ostream> // std::ostream
#include <string>  // std::string

namespace sourcemeta::jsonschema {

inline auto LOG_VERBOSE(const sourcemeta::core::Options &options)
    -> std::ostream & {
  if (options.contains("verbose")) {
    return std::cerr;
  }

  static std::ofstream null_stream;
  return null_stream;
}

inline void LOG_WARNING(const std::string &message) {
  std::cerr << "WARNING: " << message << std::endl;
}

} // namespace sourcemeta::jsonschema

#endif
