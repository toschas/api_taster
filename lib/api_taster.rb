require 'jquery-rails'
require 'remotipart'
require 'active_support/dependencies'
require 'api_taster/engine'
require 'api_taster/route'
require 'api_taster/mapper'
require 'api_taster/form_builder'
require 'api_taster/route_collector'

module ApiTaster
  mattr_accessor :global_params
  self.global_params = {}

  mattr_accessor :route_path
  def self.route_path
    @@route_path ||= begin
      "#{Rails.root.to_s}/lib/api_tasters"
    end
  end

  mattr_accessor :global_headers
  self.global_headers = {}

  mattr_accessor :app_name
  self.app_name = "API Taster"

  mattr_accessor :logo
  self.logo = nil

  mattr_accessor :home_url
  self.home_url = "/"

  def self.routes(&block)
    ApiTaster::RouteCollector.routes << block
  end

  class Exception < ::Exception; end
end
