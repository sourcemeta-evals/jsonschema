#ifndef SOURCEMETA_JSONSCHEMA_CLI_RESOLVER_STAGING_H_
#define SOURCEMETA_JSONSCHEMA_CLI_RESOLVER_STAGING_H_

#include <sourcemeta/core/json.h>

#include <map>    // std::map
#include <string> // std::string

namespace sourcemeta::jsonschema {

// Holds a snapshot of every schema document that is waiting to be
// imported so that retry passes can read them back at any time
class StagedDocuments {
public:
  auto stage(const std::string &path, const sourcemeta::core::JSON &document)
      -> void {
    this->documents_.insert_or_assign(path, document);
  }

  [[nodiscard]] auto at(const std::string &path) const
      -> const sourcemeta::core::JSON & {
    return this->documents_.at(path);
  }

  [[nodiscard]] auto contains(const std::string &path) const -> bool {
    return this->documents_.contains(path);
  }

  auto clear() -> void { this->documents_.clear(); }

private:
  std::map<std::string, sourcemeta::core::JSON> documents_{};
};

} // namespace sourcemeta::jsonschema

#endif
