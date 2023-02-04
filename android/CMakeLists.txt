project(Wishlist)
cmake_minimum_required(VERSION 3.8)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

add_compile_options(-Wall -Werror -std=c++17)

if(${CMAKE_BUILD_TYPE} STREQUAL "Debug")
  string(APPEND CMAKE_CXX_FLAGS " -DDEBUG")
endif()

set(PACKAGE_NAME "react_codegen_wishlist")
set(SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/src")
set(COMMON_SRC_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../cpp")
set(LIB_ANDROID_GENERATED_JNI_DIR ${CMAKE_CURRENT_SOURCE_DIR}/build/generated/source/codegen/jni)
set(WORKLETS_PACKAGE_NAME "react-native-worklets")
set(WORKLETS_DIR "${REACT_ANDROID_DIR}/../../react-native-worklets")

file(GLOB_RECURSE SOURCES_COMMON CONFIGURE_DEPENDS "${COMMON_SRC_DIR}/**.cpp")
file(GLOB_RECURSE SOURCES_ANDROID CONFIGURE_DEPENDS "${SRC_DIR}/main/jni/**.cpp")
file(GLOB_RECURSE SOURCES_CODEGEN CONFIGURE_DEPENDS "${LIB_ANDROID_GENERATED_JNI_DIR}/**.cpp")

# Consume shared libraries and headers from prefabs
find_package(fbjni REQUIRED CONFIG)
find_package(ReactAndroid REQUIRED CONFIG)

add_library(
  ${WORKLETS_PACKAGE_NAME}
  SHARED
  IMPORTED
  GLOBAL
)
set_target_properties(${WORKLETS_PACKAGE_NAME}
  PROPERTIES
  IMPORTED_LOCATION
  "${WORKLETS_DIR}/android/build/intermediates/merged_native_libs/debug/out/lib/arm64-v8a/librnworklets.so")
target_include_directories(
  ${WORKLETS_PACKAGE_NAME}
  INTERFACE
  "${WORKLETS_DIR}/cpp"
  "${WORKLETS_DIR}/cpp/decorators"
)

add_library(
  ${PACKAGE_NAME}
  SHARED
  ${SOURCES_COMMON}
  ${SOURCES_ANDROID}
  ${SOURCES_CODEGEN}
)

# includes
target_include_directories(
  ${PACKAGE_NAME}
  PUBLIC
  "${SRC_DIR}/main/jni"
)

target_include_directories(
  ${PACKAGE_NAME}
  PRIVATE
  "${COMMON_SRC_DIR}/DataBinding"
  "${COMMON_SRC_DIR}/DependencyInjection"
  "${COMMON_SRC_DIR}/ItemProvider"
  "${COMMON_SRC_DIR}/MGViewportCarer"
  "${COMMON_SRC_DIR}/ReanimatedRuntime"
  "${COMMON_SRC_DIR}/TemplateContainer"
  "${COMMON_SRC_DIR}/UIScheduler"
  "${COMMON_SRC_DIR}/Wishlist"
  "${COMMON_SRC_DIR}"
  "${LIB_ANDROID_GENERATED_JNI_DIR}"
)

# build shared lib
set_target_properties(${PACKAGE_NAME} PROPERTIES LINKER_LANGUAGE CXX)

target_link_libraries(
  ${PACKAGE_NAME}
  log
  android
)

target_link_libraries(
  ${PACKAGE_NAME}
  ${WORKLETS_PACKAGE_NAME}
  ReactAndroid::folly_runtime
  ReactAndroid::glog
  ReactAndroid::jsi
  ReactAndroid::reactnativejni
  ReactAndroid::react_render_graphics
  ReactAndroid::runtimeexecutor
  ReactAndroid::yoga
  ReactAndroid::react_nativemodule_core
  ReactAndroid::rrc_view
  fbjni::fbjni
)
