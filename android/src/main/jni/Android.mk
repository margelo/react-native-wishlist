THIS_DIR := $(call my-dir)
NODE_MODULES_DIR := $(THIS_DIR)/../../../../Example/node_modules
$(info "building Wishlist SO file!")


# shared library
include $(CLEAR_VARS)
LOCAL_MODULE := reanimated
LOCAL_SRC_FILES := $(THIS_DIR)/../../../../Example/node_modules/react-native-reanimated/android/build/intermediates/library_jni/debug/jni/$(TARGET_ARCH_ABI)/libreanimated.so
include $(PREBUILT_SHARED_LIBRARY)


include $(CLEAR_VARS)

include $(REACT_ANDROID_DIR)/Android-prebuilt.mk


include $(CLEAR_VARS)

LOCAL_PATH := $(THIS_DIR)
LOCAL_MODULE := wishlist_modules

LOCAL_C_INCLUDES := $(LOCAL_PATH) $(wildcard $(LOCAL_PATH)/../../../../lib/cpp/*.h)
LOCAL_C_INCLUDES += $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/headers/Tools \
        $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/headers/SpecTools \
        $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/headers/Tools \
        $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/headers/SharedItems \
        $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/headers/Registries \
        $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/hidden_headers
LOCAL_SRC_FILES := $(wildcard $(LOCAL_PATH)/*.cpp) 
LOCAL_SRC_FILES += $(wildcard $(LOCAL_PATH)/../../../../lib/cpp/*.cpp)

LOCAL_EXPORT_C_INCLUDES := $(LOCAL_PATH) $(wildcard $(LOCAL_PATH)/../../../../lib/cpp/*.h)
LOCAL_EXPORT_C_INCLUDES += $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/headers/Tools \
        $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/headers/SpecTools \
        $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/headers/Tools \
        $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/headers/SharedItems \
        $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/headers/Registries \
        $(NODE_MODULES_DIR)/react-native-reanimated/Common/cpp/hidden_headers

# Please note as one of the library listed is libreact_codegen_samplelibrary
# This name will be generated as libreact_codegen_<library-name>
# where <library-name> is the one you specified in the Gradle configuration
LOCAL_SHARED_LIBRARIES := libjsi \
    libfbjni \
    libglog \
    libfolly_json \
    libyoga \
    libreact_nativemodule_core \
    libturbomodulejsijni \
    librrc_view \
    libreact_render_core \
    libreact_render_graphics \
    libfabricjni \
    libfolly_futures \
    libreact_debug \
    libreact_render_componentregistry \
    libreact_render_debug \
    libruntimeexecutor \
    libreact_render_mapbuffer \
    libreact_codegen_rncore \
    libreanimated

LOCAL_CFLAGS := \
    -DLOG_TAG=\"ReactNative\"
LOCAL_CFLAGS += -fexceptions -frtti -std=c++17 -Wall
LOCAL_LDLIBS := -llog

include $(BUILD_SHARED_LIBRARY)