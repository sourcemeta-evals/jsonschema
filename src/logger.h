#ifndef SOURCEMETA_JSONSCHEMA_CLI_LOGGER_H_
#define SOURCEMETA_JSONSCHEMA_CLI_LOGGER_H_

#include <sourcemeta/core/options.h>

#include <fstream> // std::ofstream
#include <iostream>
#include <ostream> // std::ostream

namespace sourcemeta::jsonschema {

// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY
// UNNECESSARY

inline auto LOG_VERBOSE(const sourcemeta::core::Options &options)
    -> std::ostream & {
  if (options.contains("verbose")) {
    return std::cerr;
  }

  static std::ofstream null_stream;
  return null_stream;
}

inline std::ostream &LOG_WARNING() {
  std::cerr << "warning: ";
  return std::cerr;
}

} // namespace sourcemeta::jsonschema

#endif
