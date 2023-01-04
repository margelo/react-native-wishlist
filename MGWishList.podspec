require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
boost_compiler_flags = '-Wno-documentation'

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
    "ios/**/*.{mm,h,m,cpp}",
    "cpp/**/*.{cpp,h,m,mm,hpp}",
  ]

  s.compiler_flags = folly_compiler_flags + ' ' + boost_compiler_flags
  s.pod_target_xcconfig    = {
    "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\" \"$(PODS_ROOT)/glog\" \"$(PODS_ROOT)/RCT-Folly\""
  }
  s.xcconfig               = {
    "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\" \"$(PODS_ROOT)/glog\" \"$(PODS_ROOT)/RCT-Folly\"",
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
  }

  s.dependency "React-Core"
  s.dependency "React-RCTFabric"
  s.dependency "React-Codegen"
  s.dependency "RCT-Folly"
  s.dependency "RCTRequired"
  s.dependency "RCTTypeSafety"
  s.dependency "ReactCommon/turbomodule/core"

end

