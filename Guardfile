# A sample Guardfile
# More info at https://github.com/guard/guard#readme

# Installed by guard-jasmine-node

# JavaScript/CoffeeScript watchers

guard('jasmine-node', 
  :jasmine_node_bin => File.expand_path(File.dirname(__FILE__) + "/node_modules/jasmine-node/bin/jasmine-node"),
  :verbose => true
) do
  watch(%r{^spec/.+\.spec\.coffee$})
  watch(%r{^lib/(.+)\.js$}) { |m| "spec/#{m[1]}.spec.coffee" }
  watch(%r{^public/javascripts/shared/(.+)\.js$}) { |m| "spec/#{m[1]}.spec.coffee" }
#  watch(%r{spec/spec_helper\.(js\.coffee|js|coffee)}) { "spec" }
end

# JavaScript only watchers
#
# guard "jasmine-node", :jasmine_node_bin => File.expand_path(File.dirname(__FILE__) + "/node_modules/jasmine-node/bin/jasmine-node")  do
#   watch(%r{^spec/.+_spec\.js$})
#   watch(%r{^lib/(.+)\.js$})     { |m| "spec/lib/#{m[1]}_spec.js" }
#   watch('spec/spec_helper.js')
# end
