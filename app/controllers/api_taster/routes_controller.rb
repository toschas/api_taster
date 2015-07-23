module ApiTaster
  class RoutesController < ApiTaster::ApplicationController
    before_filter :map_routes
    layout false, except: :index

    def index
      @routes = Route.grouped_routes
    end

    def show
      @route   = Route.find(params[:id])
      @params  = Route.params_for(@route)
      @comment = Route.comment_for(@route)
    end

    private

    def map_routes
      Route.map_routes
    end
  end
end
