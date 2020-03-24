"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ns_image_cache_common_1 = require("./ns-image-cache-common");
exports.srcProperty = ns_image_cache_common_1.srcProperty;
exports.isLoadingProperty = ns_image_cache_common_1.isLoadingProperty;
var view_1 = require("ui/core/view");
var utils = require("utils/utils");
var appSettings = require("application-settings");
var types = require("utils/types");
var imageSource = require("image-source");
var utils_1 = require("utils/utils");
exports.isInitialized = false;
var ScaleType;
(function (ScaleType) {
    ScaleType.none = 'none';
    ScaleType.aspectFill = 'aspectFill';
    ScaleType.aspectFit = 'aspectFit';
    ScaleType.fill = 'fill';
})(ScaleType = exports.ScaleType || (exports.ScaleType = {}));
exports.placeholderProperty = new view_1.Property({
    name: 'placeholder',
    defaultValue: undefined,
    valueConverter: function (v) { return v; },
    affectsLayout: true
});
exports.placeholderProperty.register(ns_image_cache_common_1.NSImageBase);
exports.stretchProperty = new view_1.Property({
    name: 'stretch',
    defaultValue: ScaleType.aspectFit,
    affectsLayout: true
});
exports.stretchProperty.register(ns_image_cache_common_1.NSImageBase);
var NSImage = /** @class */ (function (_super) {
    __extends(NSImage, _super);
    function NSImage() {
        var _this = _super.call(this) || this;
        _this._imageSourceAffectsLayout = true;
        _this.nativeView = new UIImageView();
        _this.nativeView.contentMode = UIViewContentMode.ScaleAspectFit;
        _this.nativeView.clipsToBounds = true;
        _this.nativeView.userInteractionEnabled = true;
        return _this;
    }
    NSImage.prototype[ns_image_cache_common_1.srcProperty.getDefault] = function () {
        return undefined;
    };
    NSImage.prototype[ns_image_cache_common_1.srcProperty.setNative] = function (value) {
        if (value) {
            setSource(this, value);
        }
    };
    NSImage.prototype[exports.placeholderProperty.getDefault] = function () {
        return undefined;
    };
    NSImage.prototype[exports.placeholderProperty.setNative] = function (value) {
        if (value) {
        }
    };
    NSImage.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var width = utils_1.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils_1.layout.getMeasureSpecMode(widthMeasureSpec);
        var height = utils_1.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils_1.layout.getMeasureSpecMode(heightMeasureSpec);
        var nativeWidth = this.nativeView ? utils_1.layout.toDevicePixels(this.getMeasuredWidth()) : 0;
        var nativeHeight = this.nativeView ? utils_1.layout.toDevicePixels(this.getMeasuredHeight()) : 0;
        var measureWidth = Math.max(nativeWidth, this.effectiveMinWidth);
        var measureHeight = Math.max(nativeHeight, this.effectiveMinHeight);
        var finiteWidth = widthMode !== utils_1.layout.UNSPECIFIED;
        var finiteHeight = heightMode !== utils_1.layout.UNSPECIFIED;
        this._imageSourceAffectsLayout = widthMode !== utils_1.layout.EXACTLY || heightMode !== utils_1.layout.EXACTLY;
        if (nativeWidth !== 0 && nativeHeight !== 0 && (finiteWidth || finiteHeight)) {
            var scale = NSImage.computeScaleFactor(width, height, finiteWidth, finiteHeight, nativeWidth, nativeHeight, this.stretch);
            var resultW = Math.round(nativeWidth * scale.width);
            var resultH = Math.round(nativeHeight * scale.height);
            measureWidth = finiteWidth ? Math.min(resultW, width) : resultW;
            measureHeight = finiteHeight ? Math.min(resultH, height) : resultH;
            var trace = require('trace');
            trace.write('Image stretch: ' + this.stretch + ', nativeWidth: ' + nativeWidth + ', nativeHeight: ' + nativeHeight, trace.categories.Layout);
        }
        var view = require('ui/core/view');
        var widthAndState = view.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        var heightAndState = view.View.resolveSizeAndState(measureHeight, height, heightMode, 0);
        this.setMeasuredDimension(widthAndState, heightAndState);
    };
    NSImage.computeScaleFactor = function (measureWidth, measureHeight, widthIsFinite, heightIsFinite, nativeWidth, nativeHeight, imageStretch) {
        var scaleW = 1;
        var scaleH = 1;
        if ((imageStretch === ScaleType.aspectFill ||
            imageStretch === ScaleType.aspectFit ||
            imageStretch === ScaleType.fill) &&
            (widthIsFinite || heightIsFinite)) {
            scaleW = nativeWidth > 0 ? measureWidth / nativeWidth : 0;
            scaleH = nativeHeight > 0 ? measureHeight / nativeHeight : 0;
            if (!widthIsFinite) {
                scaleW = scaleH;
            }
            else if (!heightIsFinite) {
                scaleH = scaleW;
            }
            else {
                switch (imageStretch) {
                    case ScaleType.aspectFit:
                        scaleH = scaleW < scaleH ? scaleW : scaleH;
                        scaleW = scaleH;
                        break;
                    case ScaleType.aspectFill:
                        scaleH = scaleW > scaleH ? scaleW : scaleH;
                        scaleW = scaleH;
                        break;
                }
            }
        }
        return { width: scaleW, height: scaleH };
    };
    NSImage.prototype[exports.stretchProperty.getDefault] = function () {
        return ScaleType.aspectFit;
    };
    NSImage.prototype[exports.stretchProperty.setNative] = function (value) {
        switch (value) {
            case ScaleType.aspectFit:
                this.nativeView.contentMode = UIViewContentMode.ScaleAspectFit;
                break;
            case ScaleType.aspectFill:
                this.nativeView.contentMode = UIViewContentMode.ScaleAspectFill;
                break;
            case ScaleType.fill:
                this.nativeView.contentMode = UIViewContentMode.ScaleToFill;
                break;
            case ScaleType.none:
            default:
                this.nativeView.contentMode = UIViewContentMode.TopLeft;
                break;
        }
    };
    return NSImage;
}(ns_image_cache_common_1.NSImageBase));
exports.NSImage = NSImage;
var setSource = function (image, value) {
    var placeholder = image.placeholder;
    var placeholderImage = getPlaceholderUIImage(placeholder);
    if (types.isString(value)) {
        value = value.trim();
        if (value.indexOf('http') === 0) {
            image.isLoading = true;
            image['_url'] = value;
            image.ios.sd_setImageWithURLPlaceholderImageCompleted(value, placeholderImage, function () {
                image.isLoading = false;
            });
        }
        else if (utils.isFileOrResourcePath(value)) {
            image.isLoading = true;
            var source_1 = new imageSource.ImageSource();
            if (value.indexOf(utils.RESOURCE_PREFIX) === 0) {
                var path = value.substr(utils.RESOURCE_PREFIX.length);
                source_1.fromResource(path).then(function () {
                    image.isLoading = false;
                    image.ios.image = source_1.ios;
                });
            }
            else {
                source_1.fromFile(value).then(function () {
                    image.isLoading = false;
                    image.ios.image = source_1.ios;
                });
            }
        }
        image.requestLayout();
    }
};
var getPlaceholderUIImage = function (value) {
    if (types.isString(value)) {
        if (utils.isFileOrResourcePath(value)) {
            return imageSource.fromFileOrResource(value).ios;
        }
    }
    return undefined;
};
exports.setCacheLimit = function (numberOfDays) {
    var noOfSecondsInAMinute = 60;
    var noOfMinutesInAHour = 60;
    var noOfHoursInADay = 24;
    var noOfSecondsADay = noOfSecondsInAMinute * noOfMinutesInAHour * noOfHoursInADay;
    var noOfSecondsInDays = noOfSecondsADay * numberOfDays;
    var currentSeconds = Math.round(new Date().getTime() / 1000);
    var referenceTime = 0;
    if (appSettings.getBoolean('isAppOpenedFirstTime') === true ||
        appSettings.getBoolean('isAppOpenedFirstTime') === undefined ||
        appSettings.getBoolean('isAppOpenedFirstTime') === null) {
        appSettings.setBoolean('isAppOpenedFirstTime', false);
        exports.clearCache();
        appSettings.setNumber('cacheTimeReference', currentSeconds);
    }
    else {
        referenceTime = appSettings.getNumber('cacheTimeReference');
        if (referenceTime === null || referenceTime === undefined) {
            appSettings.setNumber('cacheTimeReference', currentSeconds);
        }
        else if (currentSeconds - referenceTime > noOfSecondsInDays) {
            exports.clearCache();
            appSettings.setNumber('cacheTimeReference', currentSeconds);
        }
    }
};
exports.clearCache = function () {
    var imageCache = SDImageCache.sharedImageCache();
    imageCache.clearMemory();
    if (typeof imageCache.clearDisk == 'undefined') {
        imageCache.clearDiskOnCompletion(null);
    }
    else {
        imageCache.clearDisk();
    }
};
exports.initializeOnAngular = function () {
    /*if (exports.isInitialized === false) {
        var _elementRegistry = require('nativescript-angular/element-registry');
        _elementRegistry.registerElement('NSImage', function () {
            return require('nativescript-image-cache').NSImage;
        });
        exports.isInitialized = true;
    }*/
};
exports.invalidateImage = function(key) {
    var imageCache = SDImageCache.sharedImageCache();
    imageCache.removeImageForKeyWithCompletion(key, null);
};
