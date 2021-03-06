﻿define(['visibleinviewport', 'imageloader'], function (visibleInViewport, imageLoader) {

    var wheelEvent = (document.implementation.hasFeature('Event.wheel', '3.0') ? 'wheel' : 'mousewheel');
    var thresholdX = screen.availWidth;
    var thresholdY = screen.availHeight;

    function isVisible(elem) {
        return visibleInViewport(elem, true, thresholdX, thresholdY);
    }

    function fillImage(elem) {
        var source = elem.getAttribute('data-src');
        if (source) {
            imageLoader.loadImage(elem, source).then(fadeIn);
            elem.setAttribute("data-src", '');
        }
    }

    function fadeIn(elem) {

        if (!browserInfo.animate || browserInfo.mobile) {
            return;
        }
        if (elem.classList.contains('noFade')) {
            return;
        }

        var keyframes = [
          { opacity: '0', offset: 0 },
          { opacity: '1', offset: 1 }];
        var timing = { duration: 300, iterations: 1 };
        elem.animate(keyframes, timing);
    }

    function cancelAll(tokens) {
        for (var i = 0, length = tokens.length; i < length; i++) {

            tokens[i] = true;
        }
    }

    function unveilElements(images) {

        if (!images.length) {
            return;
        }

        var cancellationTokens = [];
        function unveilInternal(tokenIndex) {

            var remaining = [];
            var anyFound = false;
            var out = false;

            // TODO: This out construct assumes left to right, top to bottom

            for (var i = 0, length = images.length; i < length; i++) {

                if (cancellationTokens[tokenIndex]) {
                    return;
                }
                var img = images[i];
                if (!out && isVisible(img)) {
                    anyFound = true;
                    fillImage(img);
                } else {

                    if (anyFound) {
                        out = true;
                    }
                    remaining.push(img);
                }
            }

            images = remaining;

            if (!images.length) {
                document.removeEventListener('focus', unveil, true);
                document.removeEventListener('scroll', unveil, true);
                document.removeEventListener(wheelEvent, unveil, true);
                window.removeEventListener('resize', unveil, true);
            }
        }

        function unveil() {

            cancelAll(cancellationTokens);

            var index = cancellationTokens.length;
            cancellationTokens.length++;

            setTimeout(function () {
                unveilInternal(index);
            }, 1);
        }

        document.addEventListener('scroll', unveil, true);
        document.addEventListener('focus', unveil, true);
        document.addEventListener(wheelEvent, unveil, true);
        window.addEventListener('resize', unveil, true);

        unveil();
    }

    function fillImages(elems) {

        for (var i = 0, length = elems.length; i < length; i++) {
            var elem = elems[0];
            fillImage(elem);
        }
    }

    function lazyChildren(elem) {

        unveilElements(elem.getElementsByClassName('lazy'), elem);
    }

    function lazyImage(elem, url) {

        elem.setAttribute('data-src', url);
        fillImages([elem]);
    }

    window.ImageLoader = {
        fillImages: fillImages,
        lazyImage: lazyImage,
        lazyChildren: lazyChildren
    };

});