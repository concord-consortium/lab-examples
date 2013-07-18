require 'rack-livereload'

use Rack::ConditionalGet
use Rack::ContentLength
use Rack::LiveReload

app = Rack::Directory.new "."

run app
