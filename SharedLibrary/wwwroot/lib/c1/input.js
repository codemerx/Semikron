window.C1SliderBase = {
    initThumb: function (thumbElem, trackElem, componentReference) {
        var thumbId = parseInt(thumbElem.getAttribute("thumbid"));
        thumbElem.onkeydown = function (e) {
            // blazor can't stop propagation. Thus do check in js.
            var handled = e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight';
            if (!handled) {
                return;
            }

            window.C1SliderBase.preventDefaultEventProcessing(e);

            componentReference.invokeMethodAsync("ThumbOnKeyDown", e.key);
        };

        window.C1SliderBase.configureDraggableElement(thumbElem, trackElem,
            function (offsetX, offsetY) {
                componentReference.invokeMethodAsync("ThumbOnPointerMove", offsetX, offsetY);
            },
            function () {
                componentReference.invokeMethodAsync("ThumbOnPointerDown", thumbId);
            },
            function () {
                componentReference.invokeMethodAsync("ThumbOnPointerUp");
            }
        );
    },

    configureDraggableElement: function (element, hitareaElem, onPointerMoveAction, onPointerDownAction, onPointerUpAction) {
        var prevOffsetX, prevOffsetY = null;
        var dx, dy = 0;

        var moveIntervalId;
        var moveInterval = 70;
        var moveIntervalFunc = function () {
            if (dx !== 0 || dy !== 0) {
                onPointerMoveAction(dx, dy);
                dx = dy = 0;
            }
        };

        var resetFunc = function () {
            clearInterval(moveIntervalId);
            dx = dy = 0;
            prevOffsetX = prevOffsetY = null;
        };

        window.C1SliderBase.configureMovableElement(element, hitareaElem,
            function (pointerMoveEvent) {
                if (!prevOffsetX || !prevOffsetY) {
                    prevOffsetX = pointerMoveEvent.offsetX;
                    prevOffsetY = pointerMoveEvent.offsetY;
                    return;
                }
                dx += pointerMoveEvent.offsetX - prevOffsetX;
                dy += pointerMoveEvent.offsetY - prevOffsetY;

                prevOffsetX = pointerMoveEvent.offsetX;
                prevOffsetY = pointerMoveEvent.offsetY;
            },
            function (pointerDownEvent) {
                if (onPointerDownAction) {
                    onPointerDownAction();
                }

                resetFunc();
                moveIntervalId = setInterval(moveIntervalFunc, moveInterval);
            },
            function (pointerUpEvent) {
                resetFunc();

                if (onPointerUpAction) {
                    onPointerUpAction();
                }
            }
        );
    },

    configureMovableElement: function (element, hitareaElem, onPointerMoveAction, onPointerDownAction, onPointerUpAction) {
        var pointerId;
        element.oncontextmenu = function (e) { e.preventDefault(); };
        element.onpointerdown = function (pointerDownEvent) {
            window.C1SliderBase.preventDefaultEventProcessing(pointerDownEvent, false);

            pointerId = pointerDownEvent.pointerId;

            hitareaElem.setPointerCapture(pointerId);

            hitareaElem.onpointermove = function (pointerMoveEvent) {
                window.C1SliderBase.preventDefaultEventProcessing(pointerMoveEvent);

                onPointerMoveAction(pointerMoveEvent);
            };

            var pointerUpEventFunc = function (pointerUpEvent) {
                window.C1SliderBase.preventDefaultEventProcessing(pointerUpEvent, false);

                hitareaElem.releasePointerCapture(pointerId);
                hitareaElem.onpointermove = null;
                hitareaElem.onpointerup = null;
                hitareaElem.onpointercancel = null;
                hitareaElem.onlostpointercapture = null;

                document.removeEventListener("pointerup", pointerUpEventFunc);

                element.blur();

                if (onPointerUpAction) {
                    onPointerUpAction(pointerUpEvent);
                }
            };

            hitareaElem.onpointerup = pointerUpEventFunc;
            hitareaElem.onpointercancel = pointerUpEventFunc;
            hitareaElem.onlostpointercapture = pointerUpEventFunc;
            document.addEventListener("pointerup", pointerUpEventFunc);
            if (onPointerDownAction) {
                onPointerDownAction(pointerDownEvent);
            }
        };
    },

    fetchElementsSizeFromStyle: function (containerElem, thumbElem, thumbOverlayElem) {
        var containerStyle = getComputedStyle(containerElem);
        var thumbStyle = getComputedStyle(thumbElem);
        var thumbOverlayStyle = getComputedStyle(thumbOverlayElem);

        var thumbWidth = parseInt(thumbStyle.getPropertyValue("width"));
        var thumbHeight = parseInt(thumbStyle.getPropertyValue("height"));
        // Browser draws a rectangle around an element, which was focused by Tab-navigation. 
        // To prevent cutting of that frame consider the extra space as part of the thumb size.
        const browserKeyboardDefaultFrameSizePx = 4.0;

        var thumbOverlayWidth = thumbOverlayStyle.width.indexOf("%") >= 0 ? parseInt(thumbOverlayStyle.width) * thumbWidth * 0.01 : parseInt(thumbOverlayStyle.width);
        var thumbOverlayHeight = thumbOverlayStyle.height.indexOf("%") >= 0 ? parseInt(thumbOverlayStyle.height) * thumbHeight * 0.01 : parseInt(thumbOverlayStyle.height);
        return [
            parseInt(containerStyle.getPropertyValue("width")),
            parseInt(containerStyle.getPropertyValue("height")),
            thumbWidth,
            thumbHeight,
            Math.max(thumbWidth, thumbOverlayWidth) + browserKeyboardDefaultFrameSizePx,
            Math.max(thumbHeight, thumbOverlayHeight) + browserKeyboardDefaultFrameSizePx
        ];
    },

    initRepeatButtons: function (lowerRepeatElem, upperRepeatElem, delay, interval, componentReference) {
        window.C1SliderBase.initRepeatButton(lowerRepeatElem, delay, interval, componentReference, "LowerRepeatClick");
        window.C1SliderBase.initRepeatButton(upperRepeatElem, delay, interval, componentReference, "UpperRepeatClick");
    },

    initRepeatButton: function (repeatButtonElem, delay, interval, componentReference, netMethod) {
        var delayId;
        var intervalId;

        repeatButtonElem.oncontextmenu = function (e) { e.preventDefault(); };

        var pointerUpEventFunc = function (e) {
            window.C1SliderBase.preventDefaultEventProcessing(e);

            clearTimeout(delayId);
            clearInterval(intervalId);

            delayId = null;
            intervalId = null;

            repeatButtonElem.onpointerup = null;
            repeatButtonElem.onpointercancel = null;
            repeatButtonElem.onlostpointercapture = null;

            document.removeEventListener("pointerup", pointerUpEventFunc);
        };

        repeatButtonElem.onpointerdown = function (e) {
            window.C1SliderBase.preventDefaultEventProcessing(e);

            clearTimeout(delayId);
            clearInterval(intervalId);

            var timeoutAction = function () {
                componentReference.invokeMethodAsync(netMethod);

                intervalId = setInterval(function () {
                    componentReference.invokeMethodAsync(netMethod);
                }, interval);
            };

            if (delay === 0) {
                timeoutAction();
            }
            else {
                delayId = setTimeout(timeoutAction, delay);
            }
            repeatButtonElem.onpointerup = pointerUpEventFunc;
            repeatButtonElem.onpointercancel = pointerUpEventFunc;
            repeatButtonElem.onlostpointercapture = pointerUpEventFunc;
            document.addEventListener("pointerup", pointerUpEventFunc);
        };
    },

    preventDefaultEventProcessing: function (e, preventDefault = true) {
        if (preventDefault) {
            e.preventDefault();
        }
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
};

window.C1Slider = Object.create(window.C1SliderBase, {
    init: {
        value: function(containerElem, trackElem, thumbElem, thumbOverlayElem, lowerRepeatElem, upperRepeatElem, delay, interval, componentReference) {
            window.C1Slider.initThumb(thumbElem, trackElem, componentReference);
            if (lowerRepeatElem && upperRepeatElem) {
                window.C1Slider.initRepeatButtons(lowerRepeatElem, upperRepeatElem, delay, interval, componentReference);
            }
            return window.C1Slider.fetchElementsSizeFromStyle(containerElem, thumbElem, thumbOverlayElem);
        }
    }
});


window.C1RangeSlider = Object.create(window.C1SliderBase, {
    init: {
        value: function (containerElem, trackElem, rangeTrackElem, lowerThumbElem, upperThumbElem, thumbOverlayElem, lowerRepeatElem, upperRepeatElem, delay, interval, componentReference) {
            window.C1RangeSlider.initThumb(lowerThumbElem, trackElem, componentReference);
            window.C1RangeSlider.initThumb(upperThumbElem, trackElem, componentReference);
            window.C1RangeSlider.initRangeTrack(rangeTrackElem, trackElem, componentReference);

            if (lowerRepeatElem && upperRepeatElem) {
                window.C1RangeSlider.initRepeatButtons(lowerRepeatElem, upperRepeatElem, delay, interval, componentReference);
            }

            return window.C1RangeSlider.fetchElementsSizeFromStyle(containerElem, lowerThumbElem, thumbOverlayElem);
        }
    },

    initRangeTrack: {
        value: function (rangeTrackElem, trackElem, componentReference) {
            window.C1RangeSlider.configureDraggableElement(rangeTrackElem, trackElem,
                function (offsetX, offsetY) {
                    componentReference.invokeMethodAsync("RangeTrackOnPointerMove", offsetX, offsetY);
                },
                function (pointerDownEvent) {
                    componentReference.invokeMethodAsync("RangeOnPointerDown");
                },
                function (pointerUpEvent) {
                    componentReference.invokeMethodAsync("RangeOnPointerUp");
                }
            );
        }
    }
});

window.C1DropDown = {
    init: function (header, isDropDownOpen, componentReference) {
        header.dropDownInstance = {
            onIsDropDownOpenChanged: function (isDropDownOpen) {
                document.removeEventListener("pointerdown", onPointerDown, true);

                if (isDropDownOpen) {
                    document.addEventListener("pointerdown", onPointerDown, true);
                }
            },

            dispose: function () {
                document.removeEventListener("pointerdown", onPointerDown, true);
                header.dropDownInstance = null;
            }
        };

        header.dropDownInstance.onIsDropDownOpenChanged(isDropDownOpen);

        function onPointerDown(e) {
            var clientX = e.clientX, clientY = e.clientY,
                hoverElement = document.elementFromPoint(clientX, clientY),
                isHeader = window.Core.contains(header, hoverElement);
            if (!isHeader) {
                e.stopPropagation();
                componentReference.invokeMethodAsync('OnIsDropDownOpenChangedAsync', false);
            }
        }
    },

    instanceCall: function (elementRef, funcName, ...args) {
        var func = elementRef.dropDownInstance[funcName];
        if (func) {
            func.apply(elementRef.dropDownInstance, args);
        }
    },

    focus: function (element, selectAll, preventScroll) {
        if (element && document.activeElement != element) {
            if (!element.select) {
                element = element.getElementsByTagName("input")[0];
            }
            element.focus({ preventScroll: preventScroll });
            if (selectAll && element.focus) {
                element.focus();
            }
            return true;
        }
        return false;
    }
};

/************ C1TextBox ************/
window.C1TextBox = {
    init: function (input, autoComplete, delay, text, componentReference) {
        input.componentReference = componentReference;
        input.AutoComplete = autoComplete;
        input.Semaphore = new Semaphore();
        window.C1TextBox.setComponentText(input, text);

        window.C1TextBox.preventDragInitiation(input);

        // Mobile browser(at least Safari) considers that value wasn't changed (so, 'change' event doesn't occur) if before value was updated programmatically.
        // 'blur' event is used for that cases(issue[C1 - 2971]).
        // For other cases 'change' event is used, which works based on specification and occur (in addition to the lost focus) when user clicks "Enter" on the keyboard.
        input.addEventListener('blur', window.C1TextBox.onChange);
        input.addEventListener('change', window.C1TextBox.onChange);

        input.oninput = e => {
            window.C1TextBox.onScroll(e);
            window.C1TextBox.onInput(e);
        };
        input.delay = delay;
        input.onkeydown = window.C1TextBox.onKeyDown;
        input.onfocus = window.C1TextBox.onFocus;
        input.onblur = window.C1TextBox.onBlur
        input.onscroll = window.C1TextBox.onScroll;
        input.onkeyup = window.C1TextBox.onScroll;
    },
    select: function (element, original, start, length) {

        if (element.value != original)
            return false;
        element.setSelectionRange(start, start + length);
        return true;
    },
    setComponentText: function (input, text) {
        window.C1TextBox.setText(input, text);
        input.LastValue = input.value;
    },

    setText: function (input, text, autocompleteText) {
        input.value = text;
        window.C1TextBox.onTextChanged(input, text, autocompleteText);
    },

    onTextChanged: function (input, text, autocompleteText) {
        var autoComplete = input.AutoComplete;
        if (autoComplete) {
            if (typeof autocompleteText == "undefined" || autocompleteText == null) {
                if (!input.value || !autoComplete.value.startsWith(input.value)) {
                    autoComplete.value = "";
                }
            }
            else {
                autoComplete.value = text + autocompleteText;
            }
        }
    },
    setAttribute: function (input, attr, value) {
        input.setAttribute(attr, value);
    },
    removeAttribute: function (input, attr) {
        input.removeAttribute(attr);
    },
    onChange: function (e) {
        var input = e.currentTarget;
        var currentValue = input.value;
        setTimeout(window.C1TextBox.notifyFinishedTextChange, 0, input, currentValue);
    },
    onInput: async function (e) {
        //console.log('onInput ' + Date.now())

        var input = e.currentTarget;
        var currentValue = input.value;
        window.C1TextBox.onTextChanged(input, currentValue);
        await window.C1TextBox.notifyTextChange(input, currentValue);
    },
    notifyFinishedTextChange: async function (input) {
        var lastNotifiedValue = input.lastNotifiedValue;
        if (lastNotifiedValue && lastNotifiedValue === input.value) {
            return;
        }

        input.lastNotifiedValue = input.value;
        var componentReference = input.componentReference;
        componentReference.invokeMethodAsync('OnTextBoxFinishedChangingAsync', input.value);
    },
    notifyTextChange: async function (input, currentValue) {
        var componentReference = input.componentReference;
        var semaphore = input.Semaphore;
        if (input.delay > 0) {
            try {
                //var before = Date.now();
                await sleep(input.delay);
                await semaphore.waitAsync();
                var lastValue = input.LastValue;
                if (input.value == currentValue && lastValue != input.value) {
                    //console.log('OnTextBoxTextChangedAsync ' + input.value)
                    input.LastValue = input.value;
                    var result = await componentReference.invokeMethodAsync('OnTextBoxTextChangedAsync', input.value);
                    //var after = Date.now();
                    //console.log((after - before).toString())
                    var newText = result[0];
                    var autocomplete = result[1];
                    if (newText.toLowerCase() == input.value.toLowerCase()) {
                        window.C1TextBox.setText(input, newText, autocomplete);
                    }
                }
            }
            finally {
                semaphore.release();
            }
        }
        else {
            componentReference.invokeMethodAsync('OnTextBoxTextChangedAsync', input.value);
        }

    },
    onKeyDown: async function (e) {

        var input = e.currentTarget;
        var autoComplete = input.AutoComplete;

        if (autoComplete && (e.key == "ArrowRight" || e.key == "Tab") && 
                    autoComplete.value && input.value != autoComplete.value &&
                    input.selectionStart == input.value.length)
        {
            input.value = autoComplete.value;
            input.setSelectionRange(autoComplete.value.length, autoComplete.value.length);
            window.C1TextBox.onInput(e);
            e.preventDefault();
            e.cancelBubble = true;
        }

        // OnTextBoxKeyDownAsync always fire on key-down emitted.
        var componentReference = input.componentReference;
        var semaphore = input.Semaphore;
        try {
            await semaphore.waitAsync();
            await componentReference.invokeMethodAsync('OnTextBoxKeyDownAsync', e.key, e.location, e.repeat, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
        }
        finally {
            semaphore.release();
        }
    },
    onFocus: async function (e) {
        //console.log(e);
        var input = e.currentTarget;
        var autoComplete = input.AutoComplete;
    },
    onBlur: async function (e) {
        //console.log(e);
        var input = e.currentTarget;
        var autoComplete = input.AutoComplete;
        if (autoComplete) {
            autoComplete.value = "";
        }
    },
    onScroll: async function (e) {
        //console.log(e);
        var input = e.currentTarget;
        var autoComplete = input.AutoComplete;
        if (autoComplete) {
            autoComplete.scrollTop = input.scrollTop;
            autoComplete.scrollLeft = input.scrollLeft;
        }
    },
    setPlaceholder: function (input, placeholder) {
        input.placeholder = placeholder;
    },

    preventDragInitiation: (elem) => {
        var stopPropagationHandler = event => {
            event.stopPropagation();
        };

        elem.addEventListener("touchstart", stopPropagationHandler, { passive: true });
        elem.addEventListener("pointerdown", stopPropagationHandler);
    }
};
/************ C1TextBox ************/

/************ C1MaskedTextBox extends C1TextBox ************/
window.C1MaskedTextBox = {
    init: function (input, autoComplete, delay, text, componentReference, maskSettings) {

        input.clientState = {
            maskSettings: maskSettings,
            recentSelection: undefined
        };

        window.C1TextBox.init(input, autoComplete, delay, text, componentReference);

        input.oninput = overrideOnInput;

        function overrideOnInput(e) {

            var maskSettings = e.target.clientState.maskSettings;

            var selectionIndex = maskText(maskSettings, e);

            window.C1TextBox.onScroll(e);

            window.C1TextBox.onInput(e);

            if (selectionIndex !== -1) {
                e.target.setSelectionRange(selectionIndex, selectionIndex);
            } else {
                invokeComponentReferenceMethod('OnMaskInputRejectedAsync', e.data, -1);
            }

        }

        input.onselect = function overrideOnSelect(e) {

            e.target.clientState.recentSelection = {
                selectionStart: e.target.selectionStart,
                selectionEnd: e.target.selectionEnd,
                selectionDirection: e.target.selectionDirection
            };

        }

        input.onpaste = function (e) {

            /*if all matched then*/
            /*if segment matched then*/

            return false;
        }


        input.onfocus = function (e) {
            setTimeout(invokeComponentReferenceMethod, 0, "OnFocusInAsync");
        }

        input.onblur = function (e) {
            setTimeout(invokeComponentReferenceMethod, 0, "OnFocusOutAsync");
        }

        if (maskSettings.acceptsTab) {

            input.addEventListener('keydown', function (e) {

                if (e.key === 'Tab') {

                    var insertIndex = e.target.selectionStart;


                    var segment = maskSettings.segments.find(s => s.visible && s.startIndex <= insertIndex && s.endIndex >= insertIndex);

                    var next = getNextTabSegment(segment);

                    if (next) {


                        var first = next.maskingElements.filter(x => x.literalElement === false).shift();

                        if (first) {
                            e.target.setSelectionRange(first.globalIndex, first.globalIndex);

                            e.preventDefault();
                        }




                    }

                }
            });


        }


        function invokeComponentReferenceMethod(functionName, ...parameters) {

            var componentReference = input.componentReference;

            if (parameters) {
                componentReference.invokeMethodAsync(functionName, ...parameters);
            } else {
                componentReference.invokeMethodAsync(functionName);
            }

        }


        function maskText(maskSettings, clonedEvent) {

            if (!maskSettings.mask) return -1;

            if (clonedEvent.inputType === 'deleteContentBackward') {
                return deleteContent(maskSettings, clonedEvent);
            }

            if (clonedEvent.inputType === 'deleteContentForward') {
                return deleteContent(maskSettings, clonedEvent);

            } else if (clonedEvent.inputType === 'deleteByCut') {
                return deleteContent(maskSettings, clonedEvent);

            } else if (clonedEvent.inputType === 'insertText') {

                if (clonedEvent.target.value.length === 1) { // reset cursor

                    clonedEvent.target.value = maskSettings.mask;
                    clonedEvent.target.selectionStart = 1;
                    clonedEvent.target.selectionEnd = 1;

                }

                return insertText(maskSettings, clonedEvent);




            } else {
                return -1;
            }
        }

        function insertText(maskSettings, clonedEvent) {

            var clonedSelectionStart = clonedEvent.target.selectionStart;
            var insertIndex = clonedSelectionStart - 1;

            var originalText = clonedEvent.target.LastValue;

            var segment = maskSettings.segments.find(s => s.visible && s.startIndex <= insertIndex && s.endIndex >= insertIndex);

            if (!segment) {

                clonedEvent.target.value = originalText;

                if (maskSettings.segments.length) {

                    var lastSegment = maskSettings.segments[maskSettings.segments.length - 1];

                    return lastSegment.endIndex + 1;

                }


            } else {


                if (segment.isSeparator) {

                    var nextSegment = getNextVisibleSegment(segment);

                    if (nextSegment) {

                        clonedEvent.target.selectionStart = nextSegment.startIndex + 1;
                        return insertText(maskSettings, clonedEvent);

                    } else {

                        clonedEvent.target.value = originalText;;
                        return segment.endIndex;
                    }
                }


                else if (segment.maskingElements) {


                    var element = segment.maskingElements.find(s => s.globalIndex === insertIndex);


                    if (element.literalElement) {

                        if (element.next) {

                            clonedEvent.target.selectionStart = element.next.globalIndex + 1;

                            return insertText(maskSettings, clonedEvent);

                        } else {

                            var nextSegment = getNextVisibleSegment(segment);

                            if (nextSegment) {

                                clonedEvent.target.selectionStart = nextSegment.startIndex + 1;
                                return insertText(maskSettings, clonedEvent);

                            } else {

                                clonedEvent.target.value = originalText;;
                                return segment.endIndex;
                            }

                        }



                    } else {

                        var transformed = transformText(clonedEvent.data, element);

                        if (transformed.invalid) {

                            clonedEvent.target.value = originalText;
                            clonedEvent.target.LastValue = originalText;

                            return insertIndex;

                        } else {

                            var actualText = clonedEvent.target.LastValue;

                            var finalText = actualText.substring(0, insertIndex) + transformed.outputText + actualText.substring(insertIndex + transformed.outputText.length, actualText.length);

                            clonedEvent.target.value = finalText;
                            clonedEvent.target.LastValue = finalText;


                            return insertIndex + 1;

                        }



                    }


                }

            }

            return clonedSelectionStart;


        }

        function getNextVisibleSegment(current) {

            var pointer = current;

            while (true) {

                var next = pointer.next;

                if (!next) return null;

                if (next.visible) {
                    return next;
                } else {
                    return getNextVisibleSegment(next);
                }

            }

        }

        function getNextTabSegment(current) {

            var pointer = current;

            while (true) {

                var next = pointer.next;

                if (!next) return null;

                if (next.visible && !next.isSeparator && next.maskingElements.some(x => x.literalElement === false)) {
                    return next;

                } else {
                    return getNextTabSegment(next);
                }

            }

        }

        function transformText(text, maskingElement) {

            var regExp = new RegExp(maskingElement.regex);

            if (!regExp.test(text)) {

                return {
                    outputText: undefined,
                    invalid: true
                };
            }

            if (maskingElement.disableShift) {
                return {
                    outputText: text
                };
            }


            if (maskingElement.shiftUp) {

                return {
                    outputText: text.toUpperCase()
                };

            }


            if (maskingElement.shiftDown) {
                return {
                    outputText: text.toLowerCase()
                };
            }

            return {
                outputText: text
            };
        }

        function deleteContent(maskSettings, clonedEvent) {

            var clonedSelectionStart = clonedEvent.target.selectionStart;
            var recentSelection = clonedEvent.target.clientState.recentSelection;

            if (recentSelection && recentSelection.selectionStart !== recentSelection.selectionEnd) {
                deleteSelection(maskSettings, clonedEvent, recentSelection);

            } else {

                deleteSelection(maskSettings, clonedEvent, {
                    selectionEnd: clonedEvent.target.selectionEnd,
                    selectionStart: clonedEvent.target.selectionStart
                });
            }


            clonedEvent.target.value = clonedEvent.target.LastValue;


            if (clonedSelectionStart === 0) {
                var segment = maskSettings.segments.find(s => (s.startIndex <= clonedSelectionStart && clonedSelectionStart <= s.endIndex) || (s.separatorIndex === clonedSelectionStart && s.visible));

                if (segment && segment.startIndex === segment.endIndex && segment.endIndex === 0 && segment.visible) { return clonedSelectionStart + 1 }

                return clonedSelectionStart;


            } else {
                return clonedSelectionStart;
            }
        }

        function deleteSelection(maskSettings, clonedEvent, selection) {

            try {

                var lastText = clonedEvent.target.LastValue;
                var startIndex = selection.selectionStart;
                var cutLength = (selection.selectionEnd - selection.selectionStart);
                var segment = maskSettings.segments.find(s => (s.separatorIndex === selection.selectionEnd - 1) && s.visible);

                segment && selection.selectionStart !== selection.selectionEnd && cutLength--;

                var newText = maskSettings.mask.substr(startIndex, Math.max(cutLength, 1));
                var result = lastText.substring(0, selection.selectionStart) + newText + lastText.substring(selection.selectionStart + newText.length, lastText.length);

                clonedEvent.target.LastValue = result;
                clonedEvent.target.value = result;


            } finally {
                clonedEvent.target.clientState.recentSelection = undefined;
            }
        }

    },

    applyMaskSettingsAsync: function (element, maskSettings) {
        element && Object.assign(element.clientState, { maskSettings });
    }
};

/************ C1MaskedTextBox ************/

/************ C1HtmlButton ************/
window.C1HtmlButton = {
    init: function (element, componentReference) {
        element.componentReference = componentReference;
        element.onclick = window.C1HtmlButton.onclick;
        window.C1HtmlButton.preventDragInitiation(element);
    },

    onclick: function (e) {
        var button = e.currentTarget;
        var componentReference = button.componentReference;
        componentReference.invokeMethodAsync('OnButtonClickAsync', e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
        e.stopPropagation();
    },

    preventDragInitiation: (elem) => {
        var stopPropagationHandler = event => {
            event.stopPropagation();
        };

        elem.addEventListener("touchstart", stopPropagationHandler);
        elem.addEventListener("pointerdown", stopPropagationHandler);
    }
};
/************ C1HtmlButton ************/


/************ C1Numeric Editor ************/

window.C1NumericEditor =
{
    init: function (input, componentReference, settings) {
        // below <setTimeout> with 0 delay is used to wrap calls to NET to avoid unexpected intervention during Blazor rendering. See for details: https://github.com/dotnet/aspnetcore/issues/26809#issuecomment-707768948
        input.componentReference = componentReference;
        input.onkeypress = (e) => window.C1NumericEditor.onkeypress(e, settings);
        input.onchange = (e) => window.C1NumericEditor.onchange(e, settings);
        input.onfocus = (e) => window.C1NumericEditor.onfocus(e);
        input.onblur = (e) => window.C1NumericEditor.onblur(e);
    },

    onkeypress: function (e, settings) {


        if (isSignKey(e.key)) {

            if ((getSelection().toString() === e.currentTarget.value)) {
                return true;
            }


            if (e.target.value === '' || e.target.value === undefined || e.target.readOnly) {
                return true;
            }

            else {
                window.C1NumericEditor.onchange(e, settings, e.key);
            }

            return false;
        }

        else if (isFinishEditingKey(settings)) {

            window.C1NumericEditor.onchange(e, settings);

            return false;
        }

        var resValue = shouldAccept(e);

        return resValue;


        function isFinishEditingKey(settings) {


            if (settings.finishEditingKeys) {

                var match = false;

                settings.finishEditingKeys.forEach(key => {

                    if (key === e.key) {

                        match = true;

                        return;
                    }

                });


                return match;
            }

            return false;

        }

        function isSignKey(key) {

            var regex = /^[+-]+$/;

            return regex.test(key);

        }

        function shouldAccept(event) {

            var decimalSeparatorKeyCode = C1NumericEditor.utils.getDecimalSeparatorKeyCode(settings.testValue);

            if (settings.isInteger && (event.keyCode === 46 || event.keyCode === 44)) return false;

            if (decimalSeparatorKeyCode === 46) if (hasGreaterThanOneDot(event)) return false;

            if (decimalSeparatorKeyCode === 44) if (hasGreaterThanOneComma(event)) return false;

            return isValidChar(event, settings.testValue);
        }

        function isValidChar(event, testStr) {

            var key = String.fromCharCode(event.keyCode);

            var regex = getAcceptedCharRegex(testStr);

            return regex.test(key);
        }

        function hasGreaterThanOneComma(event) {

            var editingValue = event.target.value;

            if (editingValue && event.keyCode === 44) {
                if (C1NumericEditor.utils.countNumberOfChar(editingValue, /\,/g) > 0) return true;
            }

            return false;
        }

        function hasGreaterThanOneDot(event) {

            var editingValue = event.target.value;

            if (editingValue && event.keyCode === 46) {
                if (C1NumericEditor.utils.countNumberOfChar(editingValue, /\./g) > 0) return true;
            }

            return false;
        }

        function getAcceptedCharRegex(testValue) {

            if (C1NumericEditor.utils.getDecimalSeparatorKeyCode(testValue) === 46) {   // ##,###.##
                return /^[0-9.]+$/;
            } else {  // ##.###,##
                return /^[0-9,]+$/;
            }
        }

    },

    onchange: function (e, settings, sign) {
        var currentTarget = e.currentTarget;
        var componentReference = currentTarget.componentReference;
        var currentTargetValue = currentTarget.value;

        if (currentTargetValue !== undefined && currentTargetValue !== null && !sign) {
            if (currentTargetValue[0] === '+') { sign = '+' }
            if (currentTargetValue[0] === '-')
            {
              sign = '-';
              currentTargetValue = currentTargetValue.substr(1);
            }
        }

      if (currentTargetValue !== 0 && !currentTargetValue) { // case user input is blank | undefined | null

            var hasMin = settings.min !== undefined && settings.min !== null;

            if (hasMin) {
                changeValue(settings.min); return;

            } else {
                changeValue(null); return;
            }

        }

      var numericValue = extractValue(currentTargetValue, settings);

        if (settings.isInteger) { // if dataType is type of integer
            if (!Number.isInteger(numericValue)) return; // but the value not is integer then do not process.
        }

        if (isNaN(numericValue)) return;

        changeValue(numericValue, sign);

        function extractValue(value, settings) {

            var numericValue;

            if (settings.testValue) {

                if (C1NumericEditor.utils.getDecimalSeparatorKeyCode(settings.testValue) === 46) {
                    numericValue = Number(
                        C1NumericEditor.utils
                            .cleanCharByRegex(value, /\,/g)
                            .replace(extractCurrencySymbol(settings.testValue), '')
                    );
                } else {
                    numericValue = Number(
                        C1NumericEditor.utils
                            .cleanCharByRegex(value, /\./g)
                            .replace(extractCurrencySymbol(settings.testValue), '')
                            .replace(',', '.')
                    );
                }

            } else {
                numericValue = Number(value);
            }


            return numericValue;
        }

        function extractCurrencySymbol(testValue) {
            if (testValue && isNaN(Number(testValue[0]))) {
                return testValue[0];
            } else {
                return '';
            }
        }

        function changeValue(value, sign) {

            var hasMax = settings.max !== undefined && settings.max !== null;
            var hasMin = settings.min !== undefined && settings.min !== null;

            if (hasMax && value > settings.max) {
                currentTarget.value = settings.max;
                setTimeout(componentReference.invokeMethodAsync.bind(componentReference),0, 'OnChangedAsync', String(settings.max), null );
                return;
            }
            if (hasMin && value < settings.min) {
                currentTarget.value = settings.min;
                setTimeout(componentReference.invokeMethodAsync.bind(componentReference), 0, 'OnChangedAsync', String(settings.min), null);
                return;
            }

            setTimeout(componentReference.invokeMethodAsync.bind(componentReference), 0, 'OnChangedAsync', String(value), sign);
        }

    },
    onfocus: function (e) {
        var currentTarget = e.currentTarget;
        var componentReference = currentTarget.componentReference;
        setTimeout(componentReference.invokeMethodAsync.bind(componentReference), 0, "OnFocusAsync");
    },
    onblur: function (e) {
        var currentTarget = e.currentTarget;
        var componentReference = currentTarget.componentReference;
        setTimeout(componentReference.invokeMethodAsync.bind(componentReference), 0, "OnFocusOutAsync");
    },
    utils: {

        cleanCharByRegex: function (str, ...regex) {

            var res = str;

            for (var i = 0; i < regex.length; i++) {
                res = str.replace(regex[i], '');
            }

            return res;
        },

        countNumberOfChar: function (str, regex) {
            return (str.match(regex) || []).length;
        },

        getDecimalSeparatorKeyCode: function (testValue) {

            var lastCommandIndex = testValue.lastIndexOf(',');
            var lastDotIndex = testValue.lastIndexOf('.');

            // ##,###.## or ##,###
            if ((lastDotIndex == -1 && lastCommandIndex > -1) || lastDotIndex > lastCommandIndex) return 46;

            // ##.###,## or ##.###
            if ((lastCommandIndex == -1 && lastDotIndex > -1) || lastCommandIndex > lastDotIndex) return 44;

            return 46;
        }
    }
}
/************ C1Numeric Editor ************/

/************ C1Window ************/
window.C1Window = {
    init: function () {
    }


};
/************ C1Window ************/

/************ C1Popup ************/
window.C1Popup = {
    init: function (overlay, popup, ownerId, ownerSelectorQuery, openTrigger, closeTrigger, openDelay, closeDelay, gap,
        position, button, isFullScreen, isDraggable, isResizable, isModeless, dimensions, isPosUpdated, closeOnPlacementTargetPositionChanged, componentReference) {
        overlay.componentReference = componentReference;
        overlay.popup = popup;       
        overlay.popup.tranX = 0;
        overlay.popup.tranY = 0;

        overlay.popup.isFullScreen = isFullScreen;
        overlay.dimensions = dimensions;
        overlay.popup.isModeless = isModeless;
        overlay.popup.isDraggableVaue = isDraggable;
        overlay.popup.isResizableValue = isResizable;

        overlay.onwheel = e => e.preventDefault();
        overlay.ontouchmove = e => e.preventDefault();
        overlay.ontouchend = e => e.preventDefault();

        overlay.onmousedown = e => window.C1Popup.onMouseDown(e);
        overlay.ontouchstart = e => window.C1Popup.onMouseDown(e);

        popup.onwheel = e => e.stopPropagation();
        popup.ontouchstart = e => e.stopPropagation();
        popup.ontouchmove = e => e.stopPropagation();
        popup.ontouchend = e => e.stopPropagation();
        overlay.button = button;
        button.onclick = e => window.C1Popup.closePopup(overlay);

        if (isDraggable || isResizable) {
            window.C1Popup.mouseDrag(overlay);
        } else {
            popup.onmousedown = e => e.stopPropagation();
        }

        if (ownerId || ownerSelectorQuery) {
            overlay.popup.closeTrigger = closeTrigger;
            overlay.popup.openTrigger = openTrigger;
            overlay.popup.openDelay = openDelay;
            overlay.popup.closeDelay = closeDelay;
            overlay.popup.gap = gap;
            overlay.popup.position = position;
            overlay.popup.owner = ownerId ? document.getElementById(ownerId) :
                ownerSelectorQuery ? document.querySelector(ownerSelectorQuery) : null;
            window.C1Popup.togglePopupSetting(overlay);
        }

        new ResizeObserver(function () {
            if (popup.owner && !popup.isFullScreen && popup.closest(".dropdown-popup"))
                window.C1Popup.layoutPopupWithOwner(overlay);
        }).observe(overlay.popup);

        var contextMenuClickHandler = function (e) {
            var clickElement = document.elementFromPoint(e.clientX, e.clientY);
            var isClickPopup = window.Core.contains(overlay.popup, clickElement);
            var isClickOwner = overlay.popup.owner ? Core.contains(overlay.popup.owner, clickElement) : false;
            
            if (isClickOwner || isClickPopup) {
                return;
            }
            e.preventDefault();
            window.C1Popup.closePopup(overlay);
        };
        document.addEventListener('contextmenu', contextMenuClickHandler, true);

        var closeOnPlacementHandler = function() {
            window.C1Popup.closePopup(overlay);
        }
        if (closeOnPlacementTargetPositionChanged) {
            document.addEventListener('scroll', closeOnPlacementHandler, true);
        }

        var adjustPositionHandler = function () {
            if (window.C1Popup.isOpen(overlay)) {
                window.C1Popup.layoutPopup(overlay, false);
            }
        };
        if (isPosUpdated) {
            document.addEventListener('scroll', adjustPositionHandler, true);
        }

        var keydownHandler = function (e) {
            if (window.C1Popup.isOpen(overlay) && e.key === 'Escape') {
                window.C1Popup.closePopup(overlay);
            }
            else if (e.target === overlay.header) {
                e.preventDefault();
            }
        };
        addEventListener('keydown', keydownHandler);

        var resizeHandler = function (e) {
            if (window.C1Popup.isOpen(overlay)) {
                window.C1Popup.layoutPopup(overlay, false);
            }
        };
        addEventListener("resize", resizeHandler);

        overlay.dispose = function() {
            document.removeEventListener('scroll', closeOnPlacementHandler, true);
            document.removeEventListener('scroll', adjustPositionHandler, true);
            document.removeEventListener('contextmenu', contextMenuClickHandler, true);

            removeEventListener('keydown', keydownHandler);
            removeEventListener("resize", resizeHandler);
        }
    },

    dispose: function (overlay) {
        if (overlay && overlay.dispose) {
            overlay.dispose();
        }
    },

    onMouseDown: function (e) {
        e = (e.touches && e.touches.length > 0) ? e.touches[0] : e;
        var overlay = e.currentTarget || e.target;
        if (e.target == overlay.popup || e.target.closest(".popup")) { return; }
        if (!overlay.popup.isModeless && !overlay.popup.owner) {
            window.C1Popup.closePopup(overlay);
        }
    },
    mouseDrag: function (overlay) {
        var popup = overlay.popup;
        if (overlay.popup.isFullScreen) {
            // Mouse events
            popup.addEventListener('mousedown', null);
            document.addEventListener('mousemove', null);
            document.addEventListener('mouseup', null);

            // Touch events	
            popup.addEventListener('touchstart', null);
            document.addEventListener('touchmove', null);
            document.addEventListener('touchend', null);
            return;
        } else {
            // Mouse events
            popup.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);

            // Touch events	
            popup.addEventListener('touchstart', onTouchDown);
            document.addEventListener('touchmove', onTouchMove);
            document.addEventListener('touchend', onTouchEnd);
        }
        // Minimum resizable area
        var minWidth = 250;
        var minHeight = 250;

        // Thresholds
        var FULLSCREEN_MARGINS = -10;
        var MARGINS = 4;

        // End of what's configurable.
        var clicked = null;
        var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;

        var rightScreenEdge, bottomScreenEdge;

        var b, x, y;

        var redraw = false;


        var popupHeader = getChildByClass(popup.querySelector(".popup-content-container"), 'popup-header');

        function onTouchDown(e) {
            onDown(e.touches[0]);
        }

        function onTouchMove(e) {
            onMove(e.touches[0]);
        }

        function onTouchEnd(e) {
            if (e.touches.length == 0) onUp(e.changedTouches[0]);
        }

        function onMouseDown(e) {
            onDown(e);
        }

        function onDown(e) {
            calc(e);
            var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;
            if (isResizing) {
                e.preventDefault();
            }
            clicked = {
                x: x,
                y: y,
                cx: e.clientX,
                cy: e.clientY,
                w: b.width,
                h: b.height,
                isResizing: isResizing,
                isMoving: !isResizing && canMove(),
                onTopEdge: onTopEdge,
                onLeftEdge: onLeftEdge,
                onRightEdge: onRightEdge,
                onBottomEdge: onBottomEdge
            };
        }

        function canMove() {
            if (!overlay.popup.isDraggableVaue || overlay.popup.isFullScreen) return false;
            return x > 0 && x < b.width && y > 0 && y < b.height
                && y < popupHeader.getBoundingClientRect().height;
        }

        function calc(e) {

            b = popup.getBoundingClientRect();
            x = e.clientX - b.left;
            y = e.clientY - b.top;
            rightScreenEdge = window.innerWidth - MARGINS;
            bottomScreenEdge = window.innerHeight - MARGINS;

            if (!overlay.popup.isResizableValue) {
                onTopEdge = onLeftEdge = onRightEdge = onBottomEdge = false;
            } else {
                onTopEdge = y < MARGINS;
                onLeftEdge = x < MARGINS;
                onRightEdge = x >= b.width - MARGINS;
                onBottomEdge = y >= b.height - MARGINS;
            }
        }

        var e;
        function onMove(ee) {
            if (clicked && clicked.isResizing)
                ee.preventDefault();
            calc(ee);
            e = ee;
            redraw = true;
        }

        function animate() {
            requestAnimationFrame(animate);

            if (!redraw) return;
            redraw = false;

            if (overlay.popup.isFullScreen) {
                popup.style.cursor = 'auto';
                return;
            }

            if (clicked && clicked.isResizing) {

                if (clicked.onRightEdge) popup.style.width = Math.max(x, minWidth) + 'px';
                if (clicked.onBottomEdge) popup.style.height = Math.max(y, minHeight) + 'px';

                if (clicked.onLeftEdge) {
                    var currentWidth = Math.max(clicked.cx - e.clientX + clicked.w, minWidth);
                    if (currentWidth > minWidth) {
                        popup.style.width = currentWidth + 'px';
                        popup.style.left = e.clientX + 'px';
                    }
                }

                if (clicked.onTopEdge) {
                    var currentHeight = Math.max(clicked.cy - e.clientY + clicked.h, minHeight);
                    if (currentHeight > minHeight) {
                        popup.style.height = currentHeight + 'px';
                        popup.style.top = e.clientY + 'px';
                    }
                }
                return;
            }

            if (clicked && clicked.isMoving) {
                // moving
                popup.style.top = (e.clientY - clicked.y) + 'px';
                popup.style.left = (e.clientX - clicked.x) + 'px';

                return;
            }

            // This code executes when mouse moves without clicking

            // style cursor
            if (onRightEdge && onBottomEdge || onLeftEdge && onTopEdge) {
                popup.style.cursor = 'nwse-resize';
            } else if (onRightEdge && onTopEdge || onBottomEdge && onLeftEdge) {
                popup.style.cursor = 'nesw-resize';
            } else if (onRightEdge || onLeftEdge) {
                popup.style.cursor = 'ew-resize';
            } else if (onBottomEdge || onTopEdge) {
                popup.style.cursor = 'ns-resize';
            } else if (canMove()) {
                popup.style.cursor = 'move';
            } else {
                popup.style.cursor = 'auto';
            }
        }

        animate();

        function onUp(e) {
            calc(e);
            clicked = null;
        }

        function getChildByClass(node, childClass) {
            var child = null;
            for (var i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i].className == childClass) {
                    child = node.childNodes[i];
                    break;
                }
            }
            return child;
        }
    },
    isDraggable: function (overlay, value) {
        overlay.popup.isDraggableVaue = value;
        window.C1Popup.mouseDrag(overlay);
    },
    isResizable: function (overlay, value) {
        overlay.popup.isResizableValue = value;
        window.C1Popup.mouseDrag(overlay);
    },
    isModeless: function (overlay, value) {
        overlay.popup.isModeless = value;
    },
    togglePopupSetting: function (overlay) {
        var popup = overlay.popup, owner = popup.owner, clientX, clientY, leaveTimeOut,
            toClose = null, toOpen = null, PopupTrigger = window.Core.PopupTrigger;

        if (!owner) return;
        else {
            owner.style.position = "relative";
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('click', toggle, false);
        owner.addEventListener('mousemove', function () {
            if (popup.openTrigger == PopupTrigger.HoverOwner && !window.C1Popup.isOpen(overlay) && !toOpen) {
                openPopup();
            }
        });

        function onMove(e) {
            clientX = e.clientX;
            clientY = e.clientY;
            leaveToClose(clientX, clientY);
        }

        function toggle(e) {
            // handle the event
            if (!e.defaultPrevented) {
                let clickElement = document.elementFromPoint(e.clientX, e.clientY);
                if (window.C1Popup.isOpen(overlay) && !toClose) {
                    var closeTrigger = popup.closeTrigger;
                    if (closeTrigger == PopupTrigger.None) return;
                    var isClickOwner = window.Core.contains(owner, clickElement),
                        isClickPopup = window.Core.contains(popup, clickElement), isClose = false;
                    switch (closeTrigger) {
                        case PopupTrigger.ClickOwner:
                            isClose = isClickOwner;
                            break;
                        case PopupTrigger.ClickPopup:
                            isClose = isClickPopup;
                            break;
                        case PopupTrigger.Click:
                            isClose = isClickPopup || isClickOwner;
                            break;
                        case PopupTrigger.BlurOwner:
                            isClose = !isClickOwner;
                            break;
                        case PopupTrigger.BlurPopup:
                            isClose = !isClickPopup;
                            break;
                        case PopupTrigger.Blur:
                            isClose = !isClickPopup && !isClickOwner;
                            break;
                    }
                    if (isClose) {
                        closePopup();
                    }
                } else {
                    if (window.Core.contains(owner, clickElement) && !toOpen) {// open the popup
                        var openTrigger = popup.openTrigger;
                        if (openTrigger == PopupTrigger.None) return;
                        if (openTrigger == PopupTrigger.ClickOwner) {
                            openPopup();
                        }
                    }
                }
            }
        };

        function openPopup() {
            toOpen = setTimeout(function () {
                window.C1Popup.openPopup(overlay);
                clearTimeout(toOpen);
                toOpen = null;
            }, overlay.popup.openDelay);
        }
        function closePopup() {
            toClose = setTimeout(function () {
                clearTimeout(toClose);
                toClose = null;
                var hoverElement = document.elementFromPoint(clientX, clientY);
                if (popup.closeTrigger == PopupTrigger.Leave && window.Core.contains(popup, hoverElement)) {
                    return;
                }
                window.C1Popup.closePopup(overlay);
            }, overlay.popup.closeDelay);
        }

        function leaveToClose(clientX, clientY) {
            if (!window.C1Popup.isOpen(overlay)) return;
            if (popup.closeTrigger == PopupTrigger.Leave) {
                var hoverElement = document.elementFromPoint(clientX, clientY),
                    isHoverOwner = window.Core.contains(owner, hoverElement),
                    isHoverPopup = window.Core.contains(popup, hoverElement);
                if (!isHoverOwner && !isHoverPopup) {
                    closePopup();
                }
            }
        }

    },

    setPopupVisibility: async function (overlay, isOpening) {
        if (overlay.style.display == "flex" && isOpening ||
            overlay.style.display == "none" && !isOpening)
            return;

        if (isOpening) {
            await window.C1Popup.openPopup(overlay);
        }
        else {
            await window.C1Popup.closePopup(overlay);
        }
    },

    setPopupWidth: async function (overlay, value) {
        var windownWidth = window.innerWidth, popupWidth = parseInt(value || 0, 10),
            popupContent = overlay.popup.getElementsByClassName("popup-content-container"),
            fitWidth = (windownWidth < popupWidth ? windownWidth : popupWidth) + "px";
        overlay.popup.style.width = fitWidth;

        if (popupContent && popupContent.length > 0 && popupContent[0].firstElementChild) {
            popupContent[0].firstElementChild.style.maxWidth = fitWidth;
        }
    },

    layoutPopup: function (overlay, isCenter = true) {
        var popup = overlay.popup, dimensions = overlay.dimensions;
        if (popup.isFullScreen) {
            window.C1Popup.layoutPopupFullScreen(overlay);
        } else {
            //if (document.documentElement.clientWidth <= 450 || document.documentElement.clientHeight <= 450) {
            //    window.C1Popup.layoutPopupFullScreen(overlay);
            //}
            //else {
            if (popup.classList.contains("full-screen-popup")) {
                popup.style.width = dimensions[2];
                popup.classList.remove("full-screen-popup");
            }
            if (popup.owner)
                window.C1Popup.layoutPopupWithOwner(overlay);
            else if (isCenter || !overlay.popup.style.top)
                window.C1Popup.layoutPopupCenter(overlay);
            // }
        }
    },
    isFullScreen: function (overlay, value) {
        overlay.popup.isFullScreen = value;
    },
    targetChanged: function (overlay, value) {
        var owner = overlay.popup.owner;
        if (owner) {
            owner.click = null;
            owner.mousedown = null;
            owner.mouseenter = null;
            owner.mouseleave = null;
            owner.blur = null;
        }
        // set new owner
        overlay.popup.owner = value ? document.getElementById(value) : null;
        window.C1Popup.togglePopupSetting(overlay);

    },
    closeTriggerChanged: function (overlay, value) {
        overlay.popup.closeTrigger = value;
        window.C1Popup.togglePopupSetting(overlay);
    },
    openTriggerChanged: function (overlay, value) {
        overlay.popup.openTrigger = value;
        window.C1Popup.togglePopupSetting(overlay);
    },
    positionChanged: function (overlay, value) {
        overlay.popup.position = value;
        window.C1Popup.layoutPopup(overlay);
    },
    layoutPopupFullScreen: function (overlay) {
        var button = overlay.button;
        var popup = overlay.popup;
        popup.style.top = null;
        popup.style.bottom = null;
        popup.style.left = null;
        popup.style.minWidth = null;
        popup.style.width = null;
        popup.style.maxWidth = null;
        popup.style.minHeight = null;
        popup.style.height = null;
        popup.style.maxHeight = null;
        button.style.display = "block";
        popup.classList.remove("floating-popup");
        popup.classList.add("full-screen-popup");
    },
    layoutPopupCenter: function (overlay) {
        var popup = overlay.popup, rc = popup.getBoundingClientRect();

        popup.style.top = overlay.dimensions[0] || (window.innerHeight / 2 - rc.height / 2) + "px";
        popup.style.left = overlay.dimensions[1] || (window.innerWidth / 2 - rc.width / 2) + "px";
    },
    layoutPopupWithOwner: async function (overlay) {
        overlay.button.style.display = "none";
        var popup = overlay.popup;

        // get reference rect, popup offset, popup position
        var bounds = window.Core.getReferenceRect(popup, popup.owner);
        var ptOffset = window.Core.getPopupOffset(popup);
        var pos = await window.Core.getPopupPosition(popup, bounds, popup.position, ptOffset, popup.gap);
        // update popup position
        var css = {};
        if (ptOffset.x == 0) {
            css.left = pos.x;
            css.top = pos.y;
        }
        else {
            css.transform = 'translate(' + pos.x + 'px, ' + pos.y + 'px)';
        }
        window.Core.setCss(popup, css);
    },


    isOpen: function (overlay) {
        return overlay.isOpen;
    },
    openPopup: async function (overlay) {
        var componentReference = overlay.componentReference;
        overlay.style.display = "block";
        window.C1Popup.layoutPopup(overlay);
        overlay.isOpen = true;
        componentReference.invokeMethodAsync('OnIsOpenChangedAsync', true);
    },
    closePopup: async function (overlay) {
        var componentReference = overlay.componentReference;
        overlay.popup.style.transform = "";
        overlay.popup.tranX = 0;
        overlay.popup.tranY = 0;
        overlay.isOpen = false;
        overlay.style.display = "none";
        componentReference.invokeMethodAsync('OnIsOpenChangedAsync', false);
    }
};
/************ C1Popup ************/

/************ C1Tooltip ************/
window.C1Tooltip = {

    init: function (tooltip, targetId, position, cssName, gap, opendelay, closedelay, componentReference) {
        tooltip.componentReference = componentReference;
        tooltip.minDistance = gap;//default distance
        tooltip.position = position;
        //listenGlobalEvents();
        var isInside = false;
        var currentElement = null;
        var _toOpen, _toClose;
        function listenGlobalEvents() {

            addEventListener('mousemove', function (e) {
                if (targetId != "") {//integrate by id
                    if (e.target.id == targetId && !isInside) {//mouse enter
                        isInside = true;
                        _openTooltip(tooltip, e.target);
                    }
                    if (isInside && e.target.id != targetId) {//mouse leave
                        isInside = false;
                        _closeTooltip(tooltip);
                    }
                }
                //else {
                //  if (cssName != "" && e.target.classList.contains(cssName)) {
                //    if (currentElement != e.target) {
                //      if (!isInside) {//mouse enter
                //        currentElement = e.target;
                //        isInside = true;
                //        _openTooltip(tooltip, e.target, e.target.innerHTML);
                //      }
                //      else {//mouse leave
                //        isInside = false;
                //        _closeTooltip(tooltip);
                //        currentElement = null;
                //      }
                //    }
                //  }
                //  else if (isInside) {
                //    isInside = false;
                //    currentElement = null;
                //    _closeTooltip(tooltip);
                //  }
                //}
            });

        }

        function _clearTimeouts() {
            if (_toOpen) {
                clearTimeout(_toOpen);
                _toOpen = null;
            }

            if (_toClose) {
                clearTimeout(_toClose);
                _toClose = null;
            }
        }

        function _openTooltip(tooltip, target, content) {
            _clearTimeouts();
            _toOpen = setTimeout(() => window.C1Tooltip.open(tooltip, target, content), opendelay);
        }
        function _closeTooltip(tt) {
            _clearTimeouts();
            _toClose = this.setTimeout(() => window.C1Tooltip.close(tt), closedelay);
        }
    },
    //open: function (tooltip, target, content) {
    //  //var rect = target.getBoundingClientRect();

    //  //if (content && content != "") {
    //  //  tooltip.backupContent = tooltip.innerHTML;
    //  //  tooltip.innerHTML = content;
    //  //}
    //  //if (!tooltip.innerHTML || tooltip.innerHTML == "") return;
    //  //tooltip.style.display = "inline";
    //  //var loc = calTooltipPosition(rect, tooltip);

    //  //tooltip.style.top = loc.y + "px";
    //  //tooltip.style.left = loc.x + "px";

    //  var componentReference = tooltip.componentReference;
    //  componentReference.invokeMethodAsync('OnOpenAsync', false);

    //  //tooltip.openPopup();
    //  function calTooltipPosition(targetBound, tooltip) {
    //    var offsetLeft = 0, offsetTop = 0, distance = tooltip.minDistance;
    //    if (tooltip.offsetParent != null) {
    //      offsetLeft = tooltip.offsetParent.offsetLeft;
    //      offsetTop = tooltip.offsetParent.offsetTop;
    //    }

    //    var ttBound = tooltip.getBoundingClientRect();
    //    var x, y;
    //    switch (tooltip.position) {
    //      case Core.PopupPosition.Above:
    //        {
    //          x = targetBound.left - offsetLeft - (ttBound.width - targetBound.width) / 2;
    //          y = targetBound.top - offsetTop - ttBound.height - distance;
    //          break;
    //        }
    //      case Core.PopupPosition.AboveLeft:
    //        {
    //          x = targetBound.left - offsetLeft;
    //          y = targetBound.top - offsetTop - ttBound.height - distance;
    //          break;
    //        }
    //      case Core.PopupPosition.AboveRight:
    //        {
    //          x = targetBound.right - offsetLeft - ttBound.width;
    //          y = targetBound.top - offsetTop - ttBound.height - distance;
    //          break;
    //        }
    //      case Core.PopupPosition.Below:
    //        {
    //          x = targetBound.left - offsetLeft - (ttBound.width - targetBound.width) / 2;
    //          y = targetBound.top + targetBound.height - offsetTop + distance;
    //          break;
    //        }
    //      case Core.PopupPosition.BelowLeft:
    //        {
    //          x = targetBound.left - offsetLeft;
    //          y = targetBound.top + targetBound.height - offsetTop + distance;
    //          break;
    //        }
    //      case Core.PopupPosition.BelowRight:
    //        {
    //          x = targetBound.left - offsetLeft - ttBound.width;
    //          y = targetBound.top + targetBound.height - offsetTop + distance;
    //          break;
    //        }
    //      case Core.PopupPosition.Left:
    //        {
    //          x = targetBound.left - offsetLeft - ttBound.width - distance;
    //          y = targetBound.top - offsetTop - (ttBound.height - targetBound.height) / 2;
    //          break;
    //        }
    //      case Core.PopupPosition.LeftTop:
    //        {
    //          x = targetBound.left - offsetLeft - ttBound.width - distance;
    //          y = targetBound.top - offsetTop;
    //          break;
    //        }
    //      case Core.PopupPosition.LeftBottom:
    //        {
    //          x = targetBound.left - offsetLeft - ttBound.width - distance;
    //          y = targetBound.bottom - offsetTop - ttBound.height;
    //          break;
    //        }
    //      case Core.PopupPosition.Right:
    //        {
    //          x = targetBound.left - offsetLeft + targetBound.width + distance;
    //          y = targetBound.top - offsetTop - (ttBound.height - targetBound.height) / 2;
    //          break;
    //        }
    //      case Core.PopupPosition.RightTop:
    //        {
    //          x = targetBound.left - offsetLeft + targetBound.width + distance;
    //          y = targetBound.top - offsetTop;
    //          break;
    //        }
    //      case Core.PopupPosition.RightBottom:
    //        {
    //          x = targetBound.left - offsetLeft + targetBound.width + distance;
    //          y = targetBound.bottom - offsetTop - ttBound.height;
    //          break;
    //        }
    //      default:
    //        x = targetBound.left;
    //        y = targetBound.top;
    //    }

    //    var body = document.body;
    //    var scrollLeft = body.scrollLeft || pageXOffset;
    //    var scrollTop = body.scrollTop || pageYOffset;
    //    x += scrollLeft;
    //    y += scrollTop;
    //    return { x: x, y: y };
    //  }

    //},


    //close: function (tooltip) {

    //  //tooltip.innerHTML = tooltip.backupContent;
    //  //tooltip.backupContent = "";

    //  var componentReference = tooltip.componentReference;
    //  componentReference.invokeMethodAsync('OnCloseAsync', false);

    //  //tooltip.style.display = "none";
    //  //tooltip.popup.closePopup();
    //}

};


/************ Core ************/
window.Core = {
    Utils: {
        // ** utility classes
        /**
         * Class that represents a point (with x and y coordinates).
         */
        Point:/** @class */ (function () {
            /**
             * Initializes a new instance of the {@link Point} class.
             *
             * @param x X coordinate of the new Point.
             * @param y Y coordinate of the new Point.
             */
            function Point(x, y) {
                if (x === void 0) { x = 0; }
                if (y === void 0) { y = 0; }
                this.x = window.Core.Utils.asNumber(x);
                this.y = window.Core.Utils.asNumber(y);
            }
            /**
             * Returns true if a {@link Point} has the same coordinates as this {@link Point}.
             *
             * @param pt {@link Point} to compare to this {@link Point}.
             */
            Point.prototype.equals = function (pt) {
                return (pt instanceof Point) && this.x == pt.x && this.y == pt.y;
            };
            /**
             * Creates a copy of this {@link Point}.
             */
            Point.prototype.clone = function () {
                return new Point(this.x, this.y);
            };
            return Point;
        }()),

        /**
         * Class that represents a rectangle (with left, top, width, and height).
         */
        Rect: /** @class */ (function () {
            /**
             * Initializes a new instance of the {@link Rect} class.
             *
             * @param left Left coordinate of the new {@link Rect}.
             * @param top Top coordinate of the new {@link Rect}.
             * @param width Width of the new {@link Rect}.
             * @param height Height of the new {@link Rect}.
             */
            function Rect(left, top, width, height) {
                this.left = window.Core.Utils.asNumber(left);
                this.top = window.Core.Utils.asNumber(top);
                this.width = window.Core.Utils.asNumber(width);
                this.height = window.Core.Utils.asNumber(height);
            }
            Object.defineProperty(Rect.prototype, "right", {
                /**
                 * Gets the right coordinate of this {@link Rect}.
                 */
                get: function () {
                    return this.left + this.width;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Rect.prototype, "bottom", {
                /**
                 * Gets the bottom coordinate of this {@link Rect}.
                 */
                get: function () {
                    return this.top + this.height;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Returns true if a {@link Rect} has the same coordinates and dimensions
             * as this {@link Rect}.
             *
             * @param rc {@link Rect} to compare to this {@link Rect}.
             */
            Rect.prototype.equals = function (rc) {
                return (rc instanceof Rect) && this.left == rc.left && this.top == rc.top && this.width == rc.width && this.height == rc.height;
            };
            /**
             * Creates a copy of this {@link Rect}.
             */
            Rect.prototype.clone = function () {
                return new Rect(this.left, this.top, this.width, this.height);
            };
            /**
             * Creates a {@link Rect} from <b>ClientRect</b> or <b>SVGRect</b> objects.
             *
             * @param rc Rectangle obtained by a call to the DOM's <b>getBoundingClientRect</b>
             * or <b>GetBoundingBox</b> methods.
             */
            Rect.fromBoundingRect = function (rc) {
                if (rc.left != null) {
                    return new Rect(rc.left, rc.top, rc.width, rc.height);
                }
                else if (rc.x != null) {
                    return new Rect(rc.x, rc.y, rc.width, rc.height);
                }
                else {
                    throw 'Invalid source rectangle.'
                }
            };
            /**
             * Gets a rectangle that represents the union of two rectangles.
             *
             * @param rc1 First rectangle.
             * @param rc2 Second rectangle.
             */
            Rect.union = function (rc1, rc2) {
                var x = Math.min(rc1.left, rc2.left), y = Math.min(rc1.top, rc2.top), right = Math.max(rc1.right, rc2.right), bottom = Math.max(rc1.bottom, rc2.bottom);
                return new Rect(x, y, right - x, bottom - y);
            };
            /**
             * Gets a rectangle that represents the intersection of two rectangles.
             *
             * @param rc1 First rectangle.
             * @param rc2 Second rectangle.
             */
            Rect.intersection = function (rc1, rc2) {
                var x = Math.max(rc1.left, rc2.left), y = Math.max(rc1.top, rc2.top), right = Math.min(rc1.right, rc2.right), bottom = Math.min(rc1.bottom, rc2.bottom);
                return new Rect(x, y, right - x, bottom - y);
            };
            /**
             * Determines whether the rectangle contains a given point or rectangle.
             *
             * @param pt The {@link Point} or {@link Rect} to ckeck.
             */
            Rect.prototype.contains = function (pt) {
                if (pt instanceof Point) {
                    return pt.x >= this.left && pt.x <= this.right &&
                        pt.y >= this.top && pt.y <= this.bottom;
                }
                else if (pt instanceof Rect) {
                    var rc2 = pt;
                    return rc2.left >= this.left && rc2.right <= this.right &&
                        rc2.top >= this.top && rc2.bottom <= this.bottom;
                }
                else {
                    throw 'Point or Rect expected.'
                }
            };
            /**
             * Creates a rectangle that results from expanding or shrinking a rectangle by the specified amounts.
             *
             * @param dx The amount by which to expand or shrink the left and right sides of the rectangle.
             * @param dy The amount by which to expand or shrink the top and bottom sides of the rectangle.
             */
            Rect.prototype.inflate = function (dx, dy) {
                return new Rect(this.left - dx, this.top - dy, this.width + 2 * dx, this.height + 2 * dy);
            };
            return Rect;
        }()),

        /**
         * Class that represents a size (with width and height).
         */
        Size: /** @class */ (function () {
            /**
             * Initializes a new instance of the {@link Size} class.
             *
             * @param width Width of the new {@link Size}.
             * @param height Height of the new {@link Size}.
             */
            function Size(width, height) {
                if (width === void 0) { width = 0; }
                if (height === void 0) { height = 0; }
                this.width = window.Core.Utils.asNumber(width);
                this.height = window.Core.Utils.asNumber(height);
            }
            /**
             * Returns true if a {@link Size} has the same dimensions as this {@link Size}.
             *
             * @param sz {@link Size} to compare to this {@link Size}.
             */
            Size.prototype.equals = function (sz) {
                return (sz instanceof Size) && this.width == sz.width && this.height == sz.height;
            };
            /**
             * Creates a copy of this {@link Size}.
             */
            Size.prototype.clone = function () {
                return new Size(this.width, this.height);
            };
            return Size;
        }()),
        asNumber: function (value, nullOK, positive) {
            if (nullOK === void 0) { nullOK = false; }
            if (positive === void 0) { positive = false; }
            if (!((nullOK && value == null) || typeof (value) == 'number')) {
                throw 'Number expected.';
            }
            if (positive && value && value < 0) {
                throw 'Positive number expected.';
            }
            return value;
        }
    },
    PopupTrigger: {
        /** No triggers; popups must be open and close using code. */
        "None": 7,
        /** When the user clicks the owner element. */
        "ClickOwner": 1,
        /** When the user clicks the popup. */
        "ClickPopup": 2,
        /** When the user clicks the owner element or the popup. */
        "Click": 3,
        /** When the owner element loses focus. */
        "BlurOwner": 4,
        /** When the popup loses focus. */
        "BlurPopup": 5,
        /** When the owner element or the popup lose focus. */
        "Blur": 6,
        /** When the mouse leaves the owner element or the popup. */
        "Leave": 8,
        /** When the mouse hover the owner element. */
        "HoverOwner": 9
    },
    PopupPosition: {
        "Above": 12, /** Above the reference element. */
        "AboveRight": 1, /** Above and aligned to the right of the reference element. */
        "RightTop": 2, /** To the right and aligned to the top of the reference element. */
        "Right": 3, /** To the right of the reference element. */
        "RightBottom": 4, /** To the right and aligned to the bottom of the reference element. */
        "BelowRight": 5, /** Below and aligned to the right of the reference element. */
        "Below": 6, /** Below the reference element. */
        "BelowLeft": 7, /** Below and aligned to the left of the reference element. */
        "LeftBottom": 8, /** To the left and aligned to the bottom of the reference element. */
        "Left": 9, /** To the left of the reference element. */
        "LeftTop": 10, /** To the left and aligned to the top of the reference element. */
        "AboveLeft": 11 /** Above and aligned to the left of the reference element. */
    },
    /**
         * Checks whether an HTML element contains another.
         *
         * @param parent Parent element.
         * @param child Child element.
         * @param popup Whether to take Wijmo popups into account.
         * @return True if the parent element contains the child element.
         */
    contains: function (parent, child, popup) {
        for (var e = child; e && parent;) {
            if (e === parent)
                return true; // found!
            e = (popup ? e[wijmo.Control._OWNR_KEY] : null) || // popup owner
                e.parentNode || // DOM parent
                e['host']; // shadow DOM
        }
        return false;
    },
    setCss: function (e, css) {
        // apply to arrays
        if (e instanceof Array) {
            for (var i = 0; i < e.length; i++) {
                setCss(e[i], css);
            }
            return;
        }
        // apply to elements
        if (e && e.style) {
            var s = e.style;
            for (var p in css) {
                // add pixel units to numeric geometric properties
                var val = css[p];
                if (typeof (val) == 'number' &&
                    p.match(/width|height|left|top|right|bottom|size|padding|margin'/i)) {
                    val = val + 'px';
                }
                // set the attribute if it changed
                if (s[p] !== val) { // TFS 312890
                    s[p] = val;
                }
            }
        }
    },
    getPopupOffset: function (popup) {
        var body = document.body, doc = document.documentElement, parent = popup.parentElement,
            ptOffset = new window.Core.Utils.Point(body.scrollLeft || pageXOffset, body.scrollTop || pageYOffset);
        if (parent != body) {
            // handle offset when parent is not the body
            var elParent = (parent == body) ? doc : (popup.offsetParent || parent);
            if (elParent == body) { // needed in Firefox: TFS 336053
                elParent = parent;
            }
            // don't do this: TFS 336455, 274224
            //if (_isjQueryDialog(parent) && parent.offsetParent) {
            //    elParent = parent.offsetParent;
            //}
            if (elParent) {
                var rc = elParent.getBoundingClientRect();
                ptOffset = new window.Core.Utils.Point(elParent.scrollLeft - rc.left, elParent.scrollTop - rc.top);
            }
        }
        // account for parent borders (TFS 335828)
        if (parent instanceof HTMLElement) { // TFS 439969
            var cs = getComputedStyle(parent);
            ptOffset.x -= parseFloat(cs.borderLeftWidth);
            ptOffset.y -= parseFloat(cs.borderTopWidth);
        }
        // done
        return ptOffset;
    },
    getReferenceRect: function (popup, ref) {
        if (ref instanceof MouseEvent) {
            if (ref.clientX <= 0 && ref.clientY <= 0 && ref.target instanceof HTMLElement) {
                // this looks like a fake mouse event (e.g. context menu key),
                // so use the event target as a reference TFS 117115
                return wijmo.Rect.fromBoundingRect(ref.target.getBoundingClientRect());
            }
            // use ref.page*-page*Offset instead of ref.client*,
            // which should be the same but gives wrong results in some scenarios 
            // (e.g. pinch-zoomed Chrome/Android)
            return new window.Core.Utils.Rect(ref.pageX - pageXOffset, ref.pageY - pageYOffset, 0, 0);
        }
        if (ref instanceof window.Core.Utils.Point) {
            return new window.Core.Utils.Rect(ref.x, ref.y, 0, 0);
        }
        if (ref instanceof HTMLElement) {
            return window.Core.Utils.Rect.fromBoundingRect(ref.getBoundingClientRect());
        }
        if (ref && ref.top != null && ref.left != null) {
            return ref;
        }
        // no reference rect
        return null;
    },

    getPopupContent: function (popup) {
        var elems = popup.getElementsByClassName("popup-content-container");
        return elems && elems.length ? elems[0] : null;
    },

    getPopupWidth: function (popup) {
        var popupWidth = parseInt(popup.style.width || 0, 10);
        if (!popupWidth) {
            // if width doesn't was set to the popup, check popup's content width
            var popupContent = window.Core.getPopupContent(popup);
            if (popupContent) {
                var popupContentStyle = getComputedStyle(popupContent);
                if (popupContentStyle.maxWidth === "max-content" || popupContentStyle.maxWidth === "min-content") {
                    popupWidth = popupContent.offsetWidth;
                }
            }
        }
        return popupWidth;
    },

    getPopupMinWidth: function (popup) {
        var popupMinWidth = 200; 
        var popupContent = window.Core.getPopupContent(popup);
        if (popupContent) {
            var popupContentStyle = getComputedStyle(popupContent);
            if (popupContentStyle.minWidth === "max-content" || popupContentStyle.minWidth === "min-content") {
                popupMinWidth = popupContent.offsetWidth;
            }
            else {
                var minWidthStyleValue = parseInt(popupContentStyle.minWidth || 0, 10)
                if (!isNaN(minWidthStyleValue) && minWidthStyleValue > 0) {
                    popupMinWidth = minWidthStyleValue;
                }
            }
        }
        return popupMinWidth;
    },

    getPopupPosition: async function (popup, bounds, position, ptOffset, gap = 0) {
        // get reference rect
        var SDMINWIDTH = window.Core.getPopupMinWidth(popup), doc = document.documentElement, scrWid = doc.clientWidth, //innerWidth,
            scrHei = doc.clientHeight; //innerHeight;

        // apply minWidth to match bounds rect
        if (!popup.style.minWidth)
            popup.style.minWidth = SDMINWIDTH + "px";
        var PP = window.Core.PopupPosition;
        switch (position) {
            case PP.Above:
            case PP.AboveLeft:
            case PP.AboveRight:
            case PP.Below:
            case PP.BelowLeft:
            case PP.BelowRight:
                if (bounds) {
                    var popupWidth = window.Core.getPopupWidth(popup);
                    var minWidth = popupWidth && popupWidth < bounds.width ? popupWidth : bounds.width;
                    if (minWidth) {
                        popup.style.minWidth = (minWidth < SDMINWIDTH ? SDMINWIDTH : minWidth) + 'px';
                    }
                }
                break;
        }
        // compute popup margins, size, min width (TFS 433456)
        var csPopup = getComputedStyle(popup), my = parseFloat(csPopup.marginTop) + parseFloat(csPopup.marginBottom),
            mx = parseFloat(csPopup.marginLeft) + parseFloat(csPopup.marginRight),
            sz = new window.Core.Utils.Size(popup.offsetWidth + (mx || 0), popup.offsetHeight + (my || 0));
        // center popup on the screen
        var pos = new window.Core.Utils.Point((scrWid - sz.width) / 2, Math.round((scrHei - sz.height) / 2 * .7));
        // position popup with respect to reference rect
        if (bounds) {
            // handle RTL
            if (csPopup.direction == 'rtl') {
                position = _getRtlPosition(position);
            }
            // calculate popup's horizontal position
            var spcLeft = bounds.left, spcRight = scrWid - bounds.right;
            pos.x = bounds.left;
            switch (position) {
                case PP.Above:
                case PP.Below:
                    pos.x = bounds.left + (bounds.width - sz.width) / 2;
                    break;
                case PP.AboveLeft:
                case PP.BelowLeft:
                    pos.x = bounds.left;
                    break;
                case PP.AboveRight:
                case PP.BelowRight:
                    pos.x = bounds.right - sz.width;
                    break;
                case PP.Left:
                case PP.LeftTop:
                case PP.LeftBottom:
                    pos.x = (spcLeft >= sz.width || spcLeft >= spcRight ? bounds.left - sz.width : bounds.right) - gap;
                    break;
                case PP.RightTop:
                case PP.RightBottom:
                case PP.Right:
                    pos.x = (spcRight >= sz.width || spcRight >= spcLeft ? bounds.right : bounds.left - sz.width) + gap;
                    break;
            }
            // calculate popup's vertical position
            var spcAbove = bounds.top, spcBelow = scrHei - bounds.bottom;
            switch (position) {
                case PP.Above:
                case PP.AboveLeft:
                case PP.AboveRight:
                    pos.y = (spcAbove >= sz.height || spcAbove >= spcBelow ? bounds.top - sz.height : bounds.bottom) - gap;
                    break;
                case PP.Below:
                case PP.BelowLeft:
                case PP.BelowRight:
                    pos.y = (spcBelow >= sz.height || spcBelow >= spcAbove ? bounds.bottom : bounds.top - sz.height) + gap;
                    break;
                case PP.LeftTop:
                case PP.RightTop:
                    pos.y = bounds.top;
                    break;
                case PP.LeftBottom:
                case PP.RightBottom:
                    pos.y = bounds.bottom - sz.height;
                    break;
                case PP.Left:
                case PP.Right:
                    pos.y = bounds.bottom - sz.height + (sz.height - bounds.height) / 2;
                    break;
            }
        }
        // make sure the popup is on the screen
        pos.x = Math.min(pos.x, scrWid - sz.width);
        pos.y = Math.min(pos.y, scrHei - sz.height);
        pos.x = Math.floor(Math.max(0, pos.x) + ptOffset.x);
        pos.y = Math.floor(pos.y + ptOffset.y);
        // done
        return pos;
    }
};