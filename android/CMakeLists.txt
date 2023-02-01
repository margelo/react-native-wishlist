project(Wishlist)
cmake_minimum_required(VERSION 3.8)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

include("${REACT_NATIVE_DIR}/ReactAndroid/cmake-utils/folly-flags.cmake")
add_compile_options(${folly_FLAGS})

string(APPEND CMAKE_CXX_FLAGS " -fexceptions -fno-omit-frame-pointer -frtti -fstack-protector-all -std=c++17 -Wall -Werror")

if(${CMAKE_BUILD_TYPE} STREQUAL "Debug")
  string(APPEND CMAKE_CXX_FLAGS " -DDEBUG")
endif()

set(PACKAGE_NAME "wishlist")
set(BUILD_DIR ${CMAKE_SOURCE_DIR}/build)
set(SRC_DIR ${CMAKE_SOURCE_DIR}/src)
set(COMMON_SRC_DIR "${CMAKE_SOURCE_DIR}/../cpp")

file(GLOB_RECURSE SOURCES_COMMON CONFIGURE_DEPENDS "${COMMON_SRC_DIR}/cpp/**.cpp")
file(GLOB_RECURSE SOURCES_ANDROID CONFIGURE_DEPENDS "${SRC_DIR}/main/jni/**.cpp")

# Consume shared libraries and headers from prefabs
find_package(fbjni REQUIRED CONFIG)
find_package(ReactAndroid REQUIRED CONFIG)

add_library(
  ${PACKAGE_NAME}
  SHARED
  ${SOURCES_COMMON}
  ${SOURCES_ANDROID}
)

# includes
target_include_directories(
  ${PACKAGE_NAME}
  PRIVATE
  "${COMMON_SRC_DIR}/cpp/DataBinding"
  "${COMMON_SRC_DIR}/cpp/DependencyInjection"
  "${COMMON_SRC_DIR}/cpp/ItemProvider"
  "${COMMON_SRC_DIR}/cpp/MGViewportCarer"
  "${COMMON_SRC_DIR}/cpp/ReanimatedRuntime"
  "${COMMON_SRC_DIR}/cpp/TemplateContainer"
  "${COMMON_SRC_DIR}/cpp/UIScheduler"
  "${COMMON_SRC_DIR}/cpp/Wishlist"
  "${COMMON_SRC_DIR}/cpp"
  "${SRC_DIR}/main/jni"
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
  ReactAndroid::folly_runtime
  ReactAndroid::glog
  ReactAndroid::jsi
  ReactAndroid::reactnativejni
  fbjni::fbjni
)

find_library(
  REACTNATIVEJNI_LIB
  reactnativejni
  PATHS ${LIBRN_DIR}
  NO_DEFAULT_PATH
  NO_CMAKE_FIND_ROOT_PATH
)

target_link_libraries(
  ${PACKAGE_NAME}
  ${JSI_LIB}
  ${GLOG_LIB}
  ${FBJNI_LIB}
  ${FOLLY_LIB}
  ${REACTNATIVEJNI_LIB}
)
