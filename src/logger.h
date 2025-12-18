#ifndef SOURCEMETA_JSONSCHEMA_CLI_LOGGER_H_
#define SOURCEMETA_JSONSCHEMA_CLI_LOGGER_H_

#include <sourcemeta/core/options.h>

#include <fstream> // std::ofstream
#include <ostream> // std::ostream

namespace sourcemeta::jsonschema {

inline auto LOG_VERBOSE(const sourcemeta::core::Options &options)
    -> std::ostream & {
  if (options.contains("verbose")) {
    return std::cerr;
  }

  static std::ofstream null_stream;
  return null_stream;
}

class WarningStream {
public:
  WarningStream() : stream_(std::cerr) { stream_ << "warning: "; }

  template <typename T> auto operator<<(const T &value) -> WarningStream & {
    stream_ << value;
    return *this;
  }

  auto operator<<(std::ostream &(*manip)(std::ostream &)) -> WarningStream & {
    manip(stream_);
    return *this;
  }

private:
  std::ostream &stream_;
};

inline auto LOG_WARNING() -> WarningStream { return WarningStream{}; }

} // namespace sourcemeta::jsonschema

#endif
