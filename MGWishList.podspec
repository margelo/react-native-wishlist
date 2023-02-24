require "json"
require File.join(File.dirname(`node --print "require.resolve('react-native/package.json')"`), "scripts/react_native_pods")

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "MGWishList"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  The fastest List component for React Native.
                   DESC
  s.homepage     = "https://github.com/margelo/react-native-wishlist"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author       = { "author" => "author@domain.cn" }
  s.platforms    =  { :ios => "12.4", :tvos => "12.4" }
  s.source       = { :git => "https://github.com/margelo/react-native-wishlist.git", :tag => "#{s.version}" }

  s.source_files = [
    "ios/**/*.{mm,h,m,cpp,hpp}",
    "cpp/**/*.{cpp,h,m,mm,hpp}",
  ]

  install_modules_dependencies(s)
end

