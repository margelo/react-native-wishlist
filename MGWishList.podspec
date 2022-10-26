require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

reactVersion = '0.0.0'

begin
  reactVersion = JSON.parse(File.read(File.join(__dir__, "..", "react-native", "package.json")))["version"]
rescue
  reactVersion = '0.64.0'
end

rnVersion = reactVersion.split('.')[1]

folly_prefix = ""
if rnVersion.to_i >= 64
  folly_prefix = "RCT-"
end

folly_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1'
folly_compiler_flags = folly_flags + ' ' + '-Wno-comma -Wno-shorten-64-to-32' + " -DRCT_NEW_ARCH_ENABLED=1"
folly_version = '2021.07.22.00'
boost_compiler_flags = '-Wno-documentation'



Pod::Spec.new do |s|
  s.name         = "MGWishList"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  MGWishList
                   DESC
  s.homepage     = "https://github.com/margelo/WishList"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author       = { "author" => "author@domain.cn" }
  s.platforms    = { :ios => "9.0", :tvos => "9.0" }
  s.source       = { :git => "https://github.com/margelo/WishList.git", :tag => "#{s.version}" }

  s.source_files = [
    "ios/**/*.{mm,h,m,cpp}",
    "cpp/*.{cpp,h,m,mm,hpp}",
  ]

  s.compiler_flags = folly_compiler_flags + ' ' + boost_compiler_flags
  s.pod_target_xcconfig    = { "HEADER_SEARCH_PATHS" => "\"$(PODS_TARGET_SRCROOT)\" \"$(PODS_TARGET_SRCROOT)/ReactCommon\" \"$(PODS_ROOT)/boost\" \"$(PODS_ROOT)/DoubleConversion\" \"$(PODS_ROOT)/RCT-Folly\" \"$(PODS_ROOT)/Headers/Private/React-Core\" \"$(PODS_ROOT)/Headers/Public/React-RCTFabric\"" }
  s.xcconfig               = { "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\" \"$(PODS_ROOT)/glog\" \"$(PODS_ROOT)/RCT-Folly\"",
                               "OTHER_CFLAGS" => "$(inherited) -DRN_FABRIC_ENABLED" + " " + folly_flags,
                               "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"  }

  s.requires_arc = true

  s.dependency "React"
  s.dependency 'FBLazyVector'
  s.dependency 'FBReactNativeSpec'
  s.dependency 'RCTRequired'
  s.dependency 'RCTTypeSafety'
  s.dependency 'React-Core'
  s.dependency "RCT-Folly/Fabric", folly_version
  s.dependency 'React-CoreModules'
  s.dependency 'React-Core/DevSupport'
  s.dependency 'React-RCTActionSheet'
  s.dependency 'React-RCTNetwork'
  s.dependency 'React-RCTAnimation'
  s.dependency 'React-RCTLinking'
  s.dependency 'React-RCTBlob'
  s.dependency 'React-RCTSettings'
  s.dependency 'React-RCTText'
  s.dependency 'React-RCTVibration'
  s.dependency 'React-RCTImage'
  s.dependency 'React-Core/RCTWebSocket'
  s.dependency 'React-cxxreact'
  s.dependency 'React-jsi'
  s.dependency 'React-jsiexecutor'
  s.dependency 'React-jsinspector'
  s.dependency 'ReactCommon/turbomodule/core'
  s.dependency 'Yoga'
  s.dependency 'DoubleConversion'
  s.dependency 'glog'
  s.dependency 'React-Fabric'
  s.dependency 'React-callinvoker'

  s.subspec 'Container' do |sp|
    sp.source_files = 'cpp/ContainerBoilerplate/*.{cpp,h,m,mm,hpp}'
  end

  s.subspec 'Interceptor' do |sp|
    sp.source_files = 'cpp/InterceptorBoilerplate/*.{cpp,h,m,mm,hpp}'
  end

  s.subspec 'Wishlist' do |sp|
    sp.source_files = 'cpp/WishlistBoilerplate/*.{cpp,h,m,mm,hpp}'
  end

end

