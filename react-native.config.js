module.exports = {
  dependency: {
    platforms: {
      android: {
        componentDescriptors: [
          'MGTemplateContainerComponentDescriptor',
          'MGTemplateInterceptorComponentDescriptor',
          'MGWishlistComponentDescriptor',
        ],
        cmakeListsPath: '../android/CMakeLists.txt',
      },
    },
  },
};
