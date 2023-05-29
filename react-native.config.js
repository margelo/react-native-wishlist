module.exports = {
  dependency: {
    platforms: {
      android: {
        componentDescriptors: [
          'MGContentContainerComponentDescriptor',
          'MGTemplateContainerComponentDescriptor',
          'MGTemplateInterceptorComponentDescriptor',
          'MGWishlistComponentDescriptor',
        ],
        cmakeListsPath: '../android/CMakeLists.txt',
      },
    },
  },
};
