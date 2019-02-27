"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("ui/core/view");
var ns_image_cache_1 = require("./ns-image-cache");
exports.NSImage = ns_image_cache_1.NSImage;
var NSImageBase = /** @class */ (function (_super) {
    __extends(NSImageBase, _super);
    function NSImageBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(NSImageBase.prototype, "android", {
        get: function () {
            return this.nativeView;
        },
        set: function (value) {
            this.nativeView = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NSImageBase.prototype, "ios", {
        get: function () {
            return this.nativeView;
        },
        set: function (value) {
            this.nativeView = value;
        },
        enumerable: true,
        configurable: true
    });
    return NSImageBase;
}(view_1.View));
exports.NSImageBase = NSImageBase;
exports.srcProperty = new view_1.Property({
    name: 'src',
    defaultValue: undefined
});
exports.srcProperty.register(NSImageBase);
exports.isLoadingProperty = new view_1.Property({
    name: 'isLoading',
    defaultValue: true,
    valueConverter: view_1.booleanConverter
});
exports.isLoadingProperty.register(NSImageBase);
