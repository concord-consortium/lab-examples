source "http://rubygems.org"

gem "rack",               "~> 1.5.2"
gem "rack-livereload",    "~> 0.3.15"

def darwin_only(require_as)
  RbConfig::CONFIG['host_os'] =~ /darwin/ && require_as
end

def linux_only(require_as)
  RbConfig::CONFIG['host_os'] =~ /linux/ && require_as
end

def windows_only(require_as)
  RbConfig::CONFIG['host_os'] =~ /mingw|mswin/i && require_as
end

group :development do

  # guard related ...
  gem "guard",              "~> 1.8.1"
  gem "guard-livereload",   "~> 1.4.0"

  # FS Notification libraries for guard (non-polling)
  gem 'rb-fsevent', "~> 0.9.3", :require => darwin_only('rb-fsevent')
  gem 'rb-inotify', "~> 0.9.0", :require => linux_only('rb-inotify')
  gem 'wdm',        "~> 0.1.0", :require => windows_only('wdm')

end
