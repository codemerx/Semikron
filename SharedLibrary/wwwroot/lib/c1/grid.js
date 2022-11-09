/************ FlexGrid ************/
window.GridBase = {
    init: function (scrollable, adornerLayer, componentReference) {
        scrollable.GridComponentReference = componentReference;
        scrollable.AdornerLayer = adornerLayer;
        scrollable.onmousemove = onmousemove;
        scrollable.onmouseleave = onmouseleave;

        scrollable.addEventListener("touchstart", function (e) {
            if (columnIndex >= 0 || rowIndex >= 0 || isChromeOnPhone) {
                e.preventDefault();
            }
            touched = true;
            isDrag = false;
            if (isChromeOnPhone) tapHandler(e);
        });

        scrollable.addEventListener("click", function (e) {
            if (columnIndex >= 0 || rowIndex >= 0) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        });

        document.addEventListener("mousemove", ondocumentmove);
        scrollable.addEventListener("touchmove", ondocumentmove, { passive: false });
        scrollable.addEventListener("touchend", ontouchend);

        var ddm = new FlexGridDragDropManager(scrollable);

        var active = false;
        var initialX;
        var initialY;
        var columnIndex = -1;
        var rowIndex = -1;
        var columnWidth;
        var rowHeight;
        var targetDrag, targetDrop, dragItem, targetDragIndex, targetDropIndex, dragDropMode = "column", dropRowItems = [],
            boundX, boundY, isDrag = false, isHeader, rowHeaderCount, rowDraggableCls = "row-draggable", colDraggableCls = "column-draggable",
            mergedCellCls = "merged-cell", colBeforeDroppable = "column-before-droppable", colAfterDroppable = "column-after-droppable",
            rowBeforeDroppable = "row-before-droppable", rowAfterDroppable = "row-after-droppable", scrollTo = null, isMouseDown = false,
            autoScrolling = false, touched = false, curX, curY, timeOut = null, isChromeOnPhone = false, offsetY = 0, offsetX = 0,
            velocityY, velocityX, frameY, frameX, timestamp, ticker, amplitudeY, amplitudeX, targetY, targetX, timeConstant = 325;

        function onmousemove(e) {
            if (!active) {
                var scrollable = e.currentTarget;
                var scrollableBoundingRect = scrollable.getBoundingClientRect();
                var x = e.clientX - scrollableBoundingRect.x;
                var y = e.clientY - scrollableBoundingRect.y;
                var p = window.GridBase.convertFromAdornerLayerPoint(scrollable, [x, y]);
                closestHeaders = window.GridBase.getClosestHeaderEdges(scrollable, p[0], p[1], 5);
                columnIndex = closestHeaders[0];
                rowIndex = closestHeaders[1];
                //console.log("onmousemove columnIndex=" + columnIndex + " rowIndex=" + rowIndex)
                if (columnIndex >= 0)
                    scrollable.style.cursor = "col-resize";
                else if (rowIndex >= 0)
                    scrollable.style.cursor = "row-resize";
                else
                    scrollable.style.cursor = "default";
            }
        }

        function onmouseleave(e) {
            var scrollable = e.currentTarget;
            scrollable.style.cursor = "default";
        }
        var achorX = 0, achorY = 0;
        function ondocumentmove(e) {
            if (dragItem) {
                e.preventDefault();
                updateDragItemPos(e);
            } else if (isChromeOnPhone){
                //Chrome browser on Phone
                if ((Math.abs(curX - initialX) > 5 || Math.abs(curY - initialY) > 5)) {
                    var deltaX = achorX - curX,
                        deltaY = achorY - curY;

                    achorX = curX;
                    achorY = curY;

                    scrollY(offsetY + deltaY);
                    scrollX(offsetX + deltaX);
                    
                }
            }
        }
        function ontouchend(e) {
            //Chrome browser on Phone
            if (touched && isChromeOnPhone && !isDrag) {
                if (Math.abs(curX - initialX) < 5 && Math.abs(curY - initialY) < 5) {
                    var cell = e.target.classList.contains("flexgrid-cell") ? e.target
                        : e.target.closest(".flexgrid-cell");
                    cell.click();
                } else {
                    clearInterval(ticker);
                    if (velocityY > 10 || velocityY < -10) {
                        amplitudeY = 0.8 * velocityY;
                        targetY = Math.round(offsetY + amplitudeY);
                        timestamp = Date.now();
                        requestAnimationFrame(autoScrollY);
                    }

                    if (velocityX > 10 || velocityX < -10) {
                        amplitudeX = 0.8 * velocityX;
                        targetX = Math.round(offsetX + amplitudeX);
                        timestamp = Date.now();
                        requestAnimationFrame(autoScrollX);
                    }
                }
            }
            touched = false;
            isDrag = false;
            isChromeOnPhone = false;
        }

        var tapedTwice = false;

        function tapHandler(e) {
            velocityY = amplitudeY = 0;
            velocityX = amplitudeX = 0;
            frameY = offsetY;
            frameX = offsetX;
            timestamp = Date.now();
            clearInterval(ticker);
            ticker = setInterval(track, 100);

            if (!tapedTwice) {
                tapedTwice = true;
                setTimeout(function () { tapedTwice = false; }, 300);
                return false;
            }
            e.preventDefault();
            //action on double tap goes below
            var cell = e.target.classList.contains("flexgrid-cell") ? e.target 
                : e.target.closest(".flexgrid-cell");
            var clickEvent = document.createEvent('MouseEvents');
            clickEvent.initEvent('dblclick', true, true);
            cell.dispatchEvent(clickEvent);
        }

        //#region auto Smoothy scrolling after touch-end
        function scrollY(y) {
            var max = scrollable.scrollHeight - scrollable.offsetHeight;
            offsetY = (y > max) ? max : (y < 0) ? 0 : y;
            scrollable.scrollTop = offsetY;
        }

        function scrollX(x) {
            var max = scrollable.scrollWidth - scrollable.offsetWidth;
            offsetX = (x > max) ? max : (x < 0) ? 0 : x;
            scrollable.scrollLeft = offsetX;
        }

        function track() {
            var now, elapsed, deltaY, vY, deltaX, vX;

            now = Date.now();
            elapsed = now - timestamp;
            timestamp = now;
            //For Y
            deltaY = offsetY - frameY;
            frameY = offsetY;
            vY = 1000 * deltaY / (1 + elapsed);
            velocityY = 0.8 * vY + 0.2 * velocityY;

            //For X
            deltaX = offsetX - frameX;
            frameX = offsetX;
            vX = 1000 * deltaX / (1 + elapsed);
            velocityX = 0.8 * vX + 0.2 * velocityX;

        }

        function autoScrollY() {
            var elapsed, delta;

            if (amplitudeY) {
                elapsed = Date.now() - timestamp;
                delta = -amplitudeY * Math.exp(-elapsed / timeConstant);
                if (delta > 0.5 || delta < -0.5) {
                    scrollY(targetY + delta);
                    requestAnimationFrame(autoScrollY);
                } else {
                    scrollY(targetY);
                }
            }
        }

        function autoScrollX() {
            var elapsed, delta;

            if (amplitudeX) {
                elapsed = Date.now() - timestamp;
                delta = -amplitudeX * Math.exp(-elapsed / timeConstant);
                if (delta > 0.5 || delta < -0.5) {
                    scrollX(targetX + delta);
                    requestAnimationFrame(autoScrollX);
                } else {
                    scrollX(targetX);
                }
            }
        }

        //#endregion auto Smoothy scrolling after touch-end

        ddm.dragStart = function (e) {
            initialX = e.clientX;
            initialY = e.clientY;
            curX = achorX = e.clientX;
            curY = achorY = e.clientY;
            var scrollableBoundingRect = scrollable.getBoundingClientRect();
            var x = e.clientX - scrollableBoundingRect.x;
            var y = e.clientY - scrollableBoundingRect.y;
            var p = window.GridBase.convertFromAdornerLayerPoint(scrollable, [x, y]);

            isMouseDown = true;

            if (e.pointerType == "touch" || e.pointerType == "pen") {
                closestHeaders = window.GridBase.getClosestHeaderEdges(scrollable, p[0], p[1], 12);
                columnIndex = closestHeaders[0];
                rowIndex = closestHeaders[1];
                if (columnIndex >= 0 || rowIndex >= 0) {
                    scrollable.style.touchAction = "none";
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
                if (window.C1Common.browser.isChrome()) isChromeOnPhone = true;
            }

            if (columnIndex >= 0 || rowIndex >= 0) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                scrollable.setPointerCapture(e.pointerId);
                active = true;
                if (columnIndex >= 0) {
                    columnWidth = window.GridBase.getColumnInfo(scrollable, columnIndex)[1];
                    if (e.pointerType == "touch" || e.pointerType == "pen")
                        drawColumnResizingLine(columnIndex, columnWidth);
                    //console.log("dragStart column" + columnIndex + " " + columnWidth)
                }
                else {
                    rowHeight = window.GridBase.getRowInfo(scrollable, rowIndex)[1];
                    if (e.pointerType == "touch" || e.pointerType == "pen")
                        drawRowResizingLine(rowIndex, rowHeight);
                    //console.log("dragStart row" + rowIndex + " " + rowHeight)
                }
                
            }
            else {
                if (dragItem) {
                    dragItem.parentNode?.removeChild(dragItem);
                    dragItem = null;
                    clearTimeout(scrollTo);
                }
                isDrag = false;
                if (e.pointerType == "touch" || e.pointerType == "pen") {
                    timeOut = setTimeout(function () {
                        startDragging(e);
                    }, 800);
                }
            }
        }

        ddm.drag = function (e) {
            curX = e.clientX;
            curY = e.clientY;
            if (active) {

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                var currentX = e.clientX - initialX;
                var currentY = e.clientY - initialY;

                if (columnIndex >= 0) {
                    var newWidth = Math.max(0, columnWidth + currentX);
                    if (e.pointerType == "touch" || e.pointerType == "pen") {
                        drawColumnResizingLine(columnIndex, newWidth);
                    }
                    //console.log("ResizeColumn columnIndex=" + columnIndex + " columnWidth=" + columnWidth + " currentX=" + currentX)
                    componentReference.invokeMethodAsync('ResizeColumn', columnIndex, newWidth);
                }
                else if (rowIndex >= 0) {
                    var newHeight = rowHeight + currentY;
                    //console.log("ResizeRow rowIndex=" + rowIndex + " rowHeight=" + rowHeight + " currentX=" + currentY)
                    if (e.pointerType == "touch" || e.pointerType == "pen") {
                        drawRowResizingLine(rowIndex, newHeight);
                    }
                    componentReference.invokeMethodAsync('ResizeRow', rowIndex, newHeight);
                }
            }
            if (dragItem) {

                updateDragItemPos(e);
                targetDropIndex = -1;
                var scrollableBoundingRect = scrollable.getBoundingClientRect();
                var x = e.clientX - scrollableBoundingRect.x;
                var y = e.clientY - scrollableBoundingRect.y;
                var p = window.GridBase.convertFromAdornerLayerPoint(scrollable, [x, y]);
                //specific drop position
                if (dragDropMode == "column") {
                    autoScroll(e, true);
                    if (e.clientX < scrollableBoundingRect.left || e.clientX > scrollableBoundingRect.right) return;

                    targetDrop?.classList?.remove(colBeforeDroppable, colAfterDroppable);
                    var colIndex = window.GridBase.getColumnIndex(scrollable, e.clientY, p[0], 0);
                    if (colIndex >= 0 && colIndex != targetDragIndex && colIndex != targetDropIndex) {
                        var headerColumnCount = parseInt(scrollable.childNodes[1].childNodes[3].childNodes[1].getAttribute("count"));
                        if ((targetDragIndex >= headerColumnCount && colIndex >= headerColumnCount) ||
                            (targetDragIndex < headerColumnCount && colIndex < headerColumnCount)) {
                            
                            targetDrop = window.GridBase.getHeaderColumnCell(scrollable, colIndex, parseInt(targetDrag.getAttribute("row-index")), isHeader);
                            if (targetDrop) {
                                targetDrop.classList.add(colIndex < targetDragIndex ? colBeforeDroppable : colAfterDroppable);
                                targetDropIndex = colIndex;
                                
                            }
                        }
                    }
                    
                    
                } else {
                    autoScroll(e, false);
                    if (e.clientY < scrollableBoundingRect.top || e.clientY > scrollableBoundingRect.bottom) return;

                    var rIndex = window.GridBase.getRowIndex(scrollable, e.clientX, p[1], 0);
                    dropRowItems.forEach(function (item) {
                        item.classList.remove(rowBeforeDroppable, rowAfterDroppable);
                    });
                    if (rIndex >= 0 && rIndex != targetDragIndex && rIndex != targetDropIndex) {
                        var headerRowCount = parseInt(scrollable.childNodes[1].childNodes[3].childNodes[2].getAttribute("count"));
                        
                        //content
                        if (rIndex >= headerRowCount) {
                            dropRowItems = window.GridBase.getCellsOfRow(scrollable, rIndex);
                            if (dropRowItems.length > 0) {
                                dropRowItems.forEach(function (item) {
                                    item.classList.add(rIndex < targetDragIndex ? rowBeforeDroppable : rowAfterDroppable);
                                });
                                targetDropIndex = rIndex;
                            }
                        }
                    }
                }
            } else if (e.pointerType != "touch" && e.pointerType != "pen") {
                startDragging(e);
            }
        }

        ddm.dragEnd = function (e) {
            if (active) {
                active = false;
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                initialX = 0;
                initialY = 0;
                adornerLayer.innerHTML = '';
                scrollable.style.touchAction = "auto";
                scrollable.releasePointerCapture(e.pointerId);
            }
            if (dragItem) {
                dragItem.parentNode?.removeChild(dragItem);
                dragItem = null;

                dropRowItems.forEach(function (item) {
                    item.classList.remove(rowBeforeDroppable, rowAfterDroppable);
                });
                targetDrop?.classList?.remove(colBeforeDroppable, colAfterDroppable);
                //execute code behind
                if (e.key != 'Escape' && targetDragIndex >= 0 && targetDropIndex >= 0 && targetDragIndex != targetDropIndex) {
                    var headerCount = dragDropMode == "column" ? parseInt(scrollable.childNodes[1].childNodes[3].childNodes[1].getAttribute("count")) : parseInt(scrollable.childNodes[1].childNodes[1].childNodes[2].getAttribute("count"));
                    var frozenColumns = dragDropMode == "column" ? parseInt(scrollable.childNodes[1].childNodes[3].childNodes[1].getAttribute("frozen-columns")) : parseInt(scrollable.childNodes[1].childNodes[1].childNodes[2].getAttribute("frozen-rows"));
                    frozenColumns = frozenColumns ? frozenColumns : 0;
                    rowHeaderCount = isHeader ? 0 : headerCount - frozenColumns;
                    if (dragDropMode == "column") {
                        componentReference.invokeMethodAsync('MoveColumn', targetDragIndex, targetDropIndex);
                    } else {
                        componentReference.invokeMethodAsync('MoveRow', targetDragIndex, targetDropIndex);
                    }
                    
                    targetDropIndex = -1;
                    targetDragIndex = -1;
                }
                if (e.pointerType == "touch" || e.pointerType == "pen") {
                    scrollable.style.touchAction = "auto";
                    document.body?.classList?.remove("disableselect");
                }
                clearTimeout(scrollTo);
                autoScrolling = false;
            }
            isMouseDown = false;
            clearTimeout(timeOut);
            timeOut = null;
        }

        ddm.apply();

        function startDragging(e) {
            if (isMouseDown && (Math.abs(curX - initialX) < 10) && (Math.abs(curY - initialY) < 10)) {
                //isDrag = true;
                var target = e.target;
                targetDrag = target.classList?.contains(colDraggableCls) ? target : target.closest("." + colDraggableCls);
                if (targetDrag) {
                    dragDropMode = "column";
                } else {
                    targetDrag = target.classList?.contains(rowDraggableCls) ? target : target.closest("." + rowDraggableCls);
                    if (targetDrag) dragDropMode = "row";
                }

                if (!targetDrag) return;

                var cellInfo = window.GridBase.getCellInfo(targetDrag);
                targetDragIndex = dragDropMode == "column" ? cellInfo[0] : cellInfo[1];
                if (targetDragIndex >= 0 && !targetDrag.classList.contains(mergedCellCls)) {
                    if (e.pointerType == "touch" || e.pointerType == "pen") {
                        scrollable.style.touchAction = "none";
                        document.body?.classList?.add("disableselect");
                    }
                    //specific target drag element
                    isHeader = window.GridBase.isHeader(scrollable, cellInfo[0], cellInfo[1], dragDropMode);
                    dragItem = createDraggingElement();
                    if (!dragItem) {
                        isDrag = false;
                        return;
                    }
                    var bound = targetDrag.getBoundingClientRect();
                    if (dragDropMode == "column") {
                        boundX = e.clientX - bound.x;
                    } else {
                        boundX = e.clientX - (scrollable.getBoundingClientRect()).x;
                    }
                    boundY = e.clientY - bound.y;

                    updateDragItemPos(e);
                    isDrag = true;
                    if (!scrollable.contains(dragItem))
                        scrollable.appendChild(dragItem);
                }
            }
        }

        function autoScroll(e, isColumnDragging) {
            e = (e.touches && e.touches.length > 0) ? e.touches[0] : e;
            var scrollableBoundingRect = scrollable.getBoundingClientRect();

            var edgeSize = 30;
            var maxStep = scrollable.classList.contains("virtualization-enabled") ? 15: 8;

            var currentScrollX = scrollable.scrollLeft, currentScrollY = scrollable.scrollTop;
            var nextScrollX = currentScrollX, nextScrollY = currentScrollY;

            var edgeTop = scrollableBoundingRect.top + edgeSize;
            var edgeLeft = scrollableBoundingRect.left + edgeSize;
            var edgeBottom = scrollableBoundingRect.bottom - edgeSize;
            var edgeRight = scrollableBoundingRect.right - edgeSize;

            var isInLeftEdge = (e.clientX < edgeLeft);
            var isInRightEdge = (e.clientX > edgeRight);
            var isInTopEdge = (e.clientY < edgeTop);
            var isInBottomEdge = (e.clientY > edgeBottom);

            (async function checkForScroll() {
                clearTimeout(scrollTo);
                autoScrolling = await adjustScroll();
                if (autoScrolling) {
                    scrollTo = setTimeout(checkForScroll, 30);
                }
            })();

            async function adjustScroll() {
                
                if (isColumnDragging) {
                    //auto scroll when hovering FlexGrid edges
                    
                    if (e.clientY < scrollableBoundingRect.bottom && e.clientY > scrollableBoundingRect.top) {
                        if (!(isInRightEdge || isInLeftEdge)) return false;
                        if (isInRightEdge) {
                            var intensity = ((e.clientX - edgeRight) / edgeSize);
                            nextScrollX = (nextScrollX + (maxStep * intensity * 1.3));
                        } else {
                            var intensity = ((edgeLeft - e.clientX) / edgeSize);
                            nextScrollX = (nextScrollX - (maxStep * intensity * 1.3));
                        }

                        nextScrollX = Math.max(0, Math.min(scrollable.scrollWidth, nextScrollX));
                        if (nextScrollX !== currentScrollX) {
                            scrollable.scrollLeft = nextScrollX;
                            offsetX = nextScrollX;
                            await scrollable.onScroll;
                            targetDropIndex = -1;
                            targetDrop?.classList?.remove(colBeforeDroppable, colAfterDroppable);
                            return (true);
                        } else return false;
                    }
                    return false;
                } else {
                    //auto scroll when hovering FlexGrid edges

                    if (e.clientX < scrollableBoundingRect.right && e.clientX > scrollableBoundingRect.left) {
                        if (!(isInTopEdge || isInBottomEdge)) return false;
                        if (isInTopEdge) {
                            var intensity = ((edgeTop - e.clientY) / edgeSize);
                            nextScrollY = (nextScrollY - (maxStep * intensity));
                        } else {
                            var intensity = ((e.clientY - edgeBottom) / edgeSize);
                            nextScrollY = (nextScrollY + (maxStep * intensity));
                        }

                        nextScrollY = Math.max(0, Math.min(scrollable.scrollHeight, nextScrollY));
                        if (nextScrollY !== currentScrollY) {
                            scrollable.scrollTop = nextScrollY;
                            offsetY = nextScrollY;
                            targetDropIndex = -1;
                            dropRowItems.forEach(function (item) {
                                item.classList.remove(rowBeforeDroppable, rowAfterDroppable);
                            });
                            return (true);
                        } else return false;
                    }
                    return false;
                }
            }
        }

        function updateDragItemPos(e) {
            //update dragging element position
            dragItem.style.top = (e.clientY - boundY) + "px";
            dragItem.style.left = (e.clientX - boundX) + "px";
        }

        function drawColumnResizingLine(col, newWidth) {
            var scrollableBoundingRect = scrollable.getBoundingClientRect();
            var colInfo = window.GridBase.getColumnInfo(scrollable, col);
            var x = window.GridBase.convertToAdornerLayerPoint(scrollable, [colInfo[0] + newWidth, 0])[0]
            var line = createline(x, 0, x, scrollableBoundingRect.height, 'rgb(0,0,0)', 2);
            adornerLayer.innerHTML = '';
            adornerLayer.appendChild(line);
        }

        function drawRowResizingLine(rowIndex, newheight) {
            var scrollableBoundingRect = scrollable.getBoundingClientRect();
            var rowInfo = window.GridBase.getRowInfo(scrollable, rowIndex);
            var y = window.GridBase.convertToAdornerLayerPoint(scrollable, [0, rowInfo[0] + newheight])[1]
            var line = createline(0, y, scrollableBoundingRect.width, y, 'rgb(0,0,0)', 2);
            adornerLayer.innerHTML = '';
            adornerLayer.appendChild(line);
        }

        function createline(x1, y1, x2, y2, color, w) {
            var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            aLine.setAttribute('x1', x1);
            aLine.setAttribute('y1', y1);
            aLine.setAttribute('x2', x2);
            aLine.setAttribute('y2', y2);
            aLine.setAttribute('stroke', color);
            aLine.setAttribute('stroke-width', w);
            return aLine;
        }

        function createDraggingElement() {
            var el, style = {
                position: "fixed",
                cursor: "pointer",
                zIndex: 999
            };
            
            var dragItems = dragDropMode == "column" ? window.GridBase.getCellsOfColumn(scrollable, targetDragIndex, isHeader) :
                window.GridBase.getCellsOfRow(scrollable, targetDragIndex);
            if (!dragItems || dragItems.length == 0) return null;
            el = document.createElement("div");
            dragItems.forEach(function (item) {
                var clone = item.cloneNode(true);
                clone.style.width = item.clientWidth + "px";
                clone.style.height = item.clientHeight + "px";
                el.appendChild(clone);
            });

            style.display = "flex";
            style.flexDirection = dragDropMode == "column" ? "column" : "row";
            style.boxShadow = "0 0 1rem rgba(0,0,0,1)";

            Object.assign(el.style, style);
            return el;
        }
    },
    convertFromAdornerLayerPoint: function (scrollable, point) {
        var topLeftPanel = scrollable.childNodes[1].childNodes[3].childNodes[3];
        var x = (point[0] > topLeftPanel.clientWidth ? (point[0] + scrollable.scrollLeft) : point[0]);
        var y = (point[1] > topLeftPanel.clientHeight ? (point[1] + scrollable.scrollTop) : point[1]);
        return [x, y];
    },
    convertToAdornerLayerPoint: function (scrollable, point) {
        var topLeftPanel = scrollable.childNodes[1].childNodes[3].childNodes[3];
        var x = (point[0] > topLeftPanel.clientWidth ? (point[0] - scrollable.scrollLeft) : point[0]);
        var y = (point[1] > topLeftPanel.clientHeight ? (point[1] - scrollable.scrollTop) : point[1]);
        return [x, y];
    },
    getClosestHeaderEdges: function (scrollable, x, y, threshold) {
        var col = -1;
        var row = -1;
        if (y > 0 && y < window.GridBase.getColumnHeadersHeight(scrollable)) {
            col = window.GridBase.getClosestColumnEdge(scrollable, x, threshold);
        }
        else if (x > 0 && x < window.GridBase.getRowHeadersWidth(scrollable)) {
            row = window.GridBase.getClosestRowEdge(scrollable, y, threshold);
        }
        return [col, row];
    },
    getColumnHeadersHeight: function (scrollable) {
        var topLeftPanel = scrollable.childNodes[1].childNodes[3].childNodes[3];
        return topLeftPanel.clientHeight;
    },
    getRowHeadersWidth: function (scrollable) {
        var topLeftPanel = scrollable.childNodes[1].childNodes[3].childNodes[3];
        return topLeftPanel.clientWidth;
    },
    getClosestColumnEdge: function (scrollable, x, threshold) {
        var columnIndex = -1;
        var col = 0;
        var count = window.GridBase.getColumnsCount(scrollable);
        while (col < count) {
            if (window.GridBase.allowResizingColumn(scrollable, col)) {
                var colInfo = window.GridBase.getColumnInfo(scrollable, col);
                var offset = colInfo[0] + colInfo[1];
                var distance = offset - x;
                if (Math.abs(distance) < threshold)
                    columnIndex = col;
                else if (distance > threshold)
                    break;
            }
            col++;
        }
        return columnIndex;
    },
    getClosestRowEdge: function (scrollable, y, threshold) {
        var rowIndex = -1;
        var row = 0;
        var count = window.GridBase.getRowsCount(scrollable);
        while (row < count) {
            if (window.GridBase.allowResizingRow(scrollable, row)) {
                var rowInfo = window.GridBase.getRowInfo(scrollable, row);
                var offset = rowInfo[0] + rowInfo[1];
                var distance = offset - y;
                if (Math.abs(distance) < threshold)
                    rowIndex = row;
                else if (distance > threshold)
                    break;
            }
            row++;
        }
        return rowIndex;
    },
    getColumnsCount: function (scrollable) {
        var topPanelColumns = scrollable.childNodes[1].childNodes[1].childNodes[1]
        var topLeftPanelColumns = scrollable.childNodes[1].childNodes[3].childNodes[1]
        return parseInt(topLeftPanelColumns.getAttribute("count")) + parseInt(topPanelColumns.getAttribute("count"));
    },
    getRowsCount: function (scrollable) {
        var leftPanelRows = scrollable.childNodes[1].childNodes[2].childNodes[2]
        var topLeftPanelRows = scrollable.childNodes[1].childNodes[3].childNodes[2]
        return parseInt(topLeftPanelRows.getAttribute("count")) + parseInt(leftPanelRows.getAttribute("count"));
    },
    getColumn: function (scrollable, columnIndex) {
        var topLeftPanelColumns = scrollable.childNodes[1].childNodes[3].childNodes[1];
        var frozenColumns = parseInt(topLeftPanelColumns.getAttribute("count"));
        if (columnIndex < frozenColumns) {
            for (var i = 0; i < topLeftPanelColumns.childNodes.length; i++) {
                var column = topLeftPanelColumns.childNodes[i];
                if (column !== undefined && parseInt(column.getAttribute("index")) == columnIndex) {
                    return column;
                }
            }
        }
        var topPanelColumns = scrollable.childNodes[1].childNodes[1].childNodes[1]
        for (var i = 0; i < topPanelColumns.childNodes.length; i++) {
            var column = topPanelColumns.childNodes[i];
            if (column !== undefined && parseInt(column.getAttribute("index")) == columnIndex) {
                return column;
            }
        }
        return undefined;
    },
    getRowIndex: function (scrollable, mouseX, y, threshold) {
        var rowIndex = -1;
        var bound = scrollable.getBoundingClientRect();
        if (mouseX > bound.left && mouseX < bound.right) {
            var row = 0;
            var count = window.GridBase.getRowsCount(scrollable);
            while (row < count) {
                var rowInfo = window.GridBase.getRowInfo(scrollable, row);
                var offset = rowInfo[0] + rowInfo[1];
                if (y > (rowInfo[0] + threshold) && y < (offset - threshold)) {
                    rowIndex = row;
                    break;
                }
                row++;
            }
        }
        return rowIndex;
    },
    getColumnIndex: function (scrollable, mouseY, x, threshold) {
        var columnIndex = -1;
        var bound = scrollable.childNodes[1].childNodes[1].getBoundingClientRect();
        if (mouseY > bound.top && mouseY < bound.bottom) {
            var col = 0;
            var count = window.GridBase.getColumnsCount(scrollable);
            while (col < count) {
                var colInfo = window.GridBase.getColumnInfo(scrollable, col);
                var offset = colInfo[0] + colInfo[1];
                if (x > (colInfo[0] + threshold) && x < (offset - threshold)) {
                    columnIndex = col;
                    break;
                }
                col++;
            }
        }
        return columnIndex;
    },
    getRow: function (scrollable, rowIndex) {
        var topLeftPanelRows = scrollable.childNodes[1].childNodes[3].childNodes[2];
        var frozenRows = parseInt(topLeftPanelRows.getAttribute("count"));
        if (rowIndex < frozenRows) {
            for (var i = 0; i < topLeftPanelRows.childNodes.length; i++) {
                var row = topLeftPanelRows.childNodes[i];
                if (row !== undefined && parseInt(row.getAttribute("index")) == rowIndex) {
                    return row;
                }
            }
        }
        var leftPanelRows = scrollable.childNodes[1].childNodes[2].childNodes[2]
        for (var i = 0; i < leftPanelRows.childNodes.length; i++) {
            var row = leftPanelRows.childNodes[i];
            if (row !== undefined && parseInt(row.getAttribute("index")) == rowIndex) {
                return row;
            }
        }
        return undefined;
    },
    allowResizingColumn: function (scrollable, columnIndex) {
        var column = window.GridBase.getColumn(scrollable, columnIndex);
        if (column === undefined)
            return false;
        var allowResizing = column.getAttribute("allowResizing");
        if (allowResizing != null)
            return allowResizing == "true";
        return column.parentNode.getAttribute("allowResizing") == "true";
    },
    allowResizingRow: function (scrollable, rowIndex) {
        var row = window.GridBase.getRow(scrollable, rowIndex);
        if (row === undefined)
            return false;
        var allowResizing = row.getAttribute("allowResizing");
        if (allowResizing != null)
            return allowResizing == "true";
        return row.parentNode.getAttribute("allowResizing") == "true";
    },
    getColumnInfo: function (scrollable, columnIndex) {
        var topLeftPanelColumns = scrollable.childNodes[1].childNodes[3].childNodes[1];
        var topLeftPanel = scrollable.childNodes[1].childNodes[3].childNodes[3];
        var frozenColumns = parseInt(topLeftPanelColumns.getAttribute("count"));
        if (columnIndex < frozenColumns) {
            var cell = window.GridBase.getFirstCellOfColumn(topLeftPanel, columnIndex);
            if (cell != null)
                return [cell.offsetLeft, cell.clientWidth];
        }
        var topPanel = scrollable.childNodes[1].childNodes[1].childNodes[3];
        var cell = window.GridBase.getFirstCellOfColumn(topPanel, columnIndex - frozenColumns);
        if (cell != null)
            return [topLeftPanel.clientWidth + cell.offsetLeft, cell.clientWidth];
        return [0, 0];
    },
    getRowInfo: function (scrollable, rowIndex) {
        var topLeftPanelRows = scrollable.childNodes[1].childNodes[3].childNodes[2];
        var topLeftPanel = scrollable.childNodes[1].childNodes[3].childNodes[3];
        var frozenRows = parseInt(topLeftPanelRows.getAttribute("count"));
        if (rowIndex < frozenRows) {
            var cell = window.GridBase.getFirstCellOfRow(topLeftPanel, rowIndex);
            if (cell != null)
                return [cell.offsetTop, cell.clientHeight];
        }
        var leftPanel = scrollable.childNodes[1].childNodes[2].childNodes[3];
        var cell = window.GridBase.getFirstCellOfRow(leftPanel, rowIndex - frozenRows);
        if (cell != null)
            return [topLeftPanel.clientHeight + cell.offsetTop, cell.clientHeight];
        return [0, 0];
    },
    getFirstCellOfColumn: function (gridCellsPanel, columnIndex) {
        for (child in gridCellsPanel.childNodes) {
            var cell = gridCellsPanel.childNodes[child];
            if (cell.tagName == 'DIV' && parseInt(cell.style.gridColumnStart) - 1 == columnIndex && cell.style.gridColumnEnd == "auto")
                return cell;
        }
        return null;
    },
    getFirstCellOfRow: function (gridCellsPanel, rowIndex) {
        for (child in gridCellsPanel.childNodes) {
            var cell = gridCellsPanel.childNodes[child];
            if (cell.tagName == 'DIV' && parseInt(cell.style.gridRowStart) - 1 == rowIndex && cell.style.gridRowEnd == "auto")
                return cell;
        }
        return null;
    },
    getCellsOfRow: function (scrollable, rowIndex) {
        var nodes = (Array.from(scrollable.childNodes[1].childNodes[2].childNodes[3].childNodes).filter(window.GridBase.filterMergedCell))
            .concat(Array.from(scrollable.childNodes[1].childNodes[0].childNodes[1].childNodes));
        var cells = [];
        for (child in nodes) {
            var cell = nodes[child];
            if (cell.tagName == 'DIV' && parseInt(cell.getAttribute("row-index")) == rowIndex)
                cells.push(cell);
        }
        return cells;
    },
    getCellsOfColumn: function (scrollable, columnIndex, isHeader = false) {
        var nodes = [];
        if (isHeader) 
            nodes = (Array.from(scrollable.childNodes[1].childNodes[3].childNodes[3].childNodes).filter(window.GridBase.filterMergedCell))
                .concat(Array.from(scrollable.childNodes[1].childNodes[2].childNodes[3].childNodes));
        else nodes = (Array.from(scrollable.childNodes[1].childNodes[1].childNodes[3].childNodes).filter(window.GridBase.filterMergedCell))
            .concat(Array.from(scrollable.childNodes[1].childNodes[0].childNodes[1].childNodes));
        var cells = [];
        for (child in nodes) {
            var cell = nodes[child];
            if (cell.tagName == 'DIV' && parseInt(cell.getAttribute("col-index")) == columnIndex)
                cells.push(cell);
        }
        return cells;
    },
    filterMergedCell: function (item) {
        return !item.classList.contains("merged-cell");
    },
    getHeaderColumnCell: function (scrollable, colIndex, rowIndex, isRowHeader) {
        var nodes = isRowHeader ? scrollable.childNodes[1].childNodes[3].childNodes[3].childNodes : scrollable.childNodes[1].childNodes[1].childNodes[3].childNodes;
        for (child in nodes) {
            var cell = nodes[child];
            if (cell.tagName == 'DIV' && parseInt(cell.getAttribute("col-index")) == colIndex && parseInt(cell.getAttribute("row-index")) == rowIndex)
                return cell;
        }
        return null;
    },
    transferFocus: async function (input1, input2) {
        var currentValue = input2.value;
        window.C1TextBox.setText(input1, currentValue, '');
        window.C1View.focus(input1, false);
        var oldType = input1.type;
        input1.type = "text";//This is necessary to avoid chrome exception
        input1.setSelectionRange(input1.value.length, input1.value.length);
        input1.type = oldType;
        input2.value = '';
        await window.C1TextBox.notifyTextChange(input1, currentValue);
    },
    clearInput: async function (input) {
        input.value = '';
    },
    onScroll: function (e) {
        //var scrollable = e.currentTarget;
        //var content = scrollable.Content;
        //var topHeader = scrollable.TopHeader;
        //var leftHeader = scrollable.LeftHeader;
        //var topLeftHeader = scrollable.TopLeftHeader;

        //var scrollTop = scrollable.scrollTop;
        //var scrollLeft = scrollable.scrollLeft;

        //var firstRow = scrollTop / 47;
        //var lastRow = (scrollTop + scrollable.clientHeight) / 47;
        //var firstColumn = scrollLeft / 100;
        //var lastColumn = (scrollLeft + scrollable.clientWidth) / 100;

        //var gridPanel = content.children[0];

        //for (i = 0; i < gridPanel.children.length; i++) {
        //    var cell = gridPanel.children[i];
        //    var column = cell.style.gridColumn;
        //    var row = cell.style.gridRow;
        //}
    },

    getCellInfo: function (item) {
        var colIndex = item.getAttribute("col-index");
        var rowIndex = item.getAttribute("row-index");
        return [parseInt(colIndex), parseInt(rowIndex)];
    },

    isHeader: function (scrollable, colIndex, rowIndex, dragDropMode) {
        var topPanelChildNodes = dragDropMode == "column" ? scrollable.childNodes[1].childNodes[3].childNodes[3].childNodes :
            scrollable.childNodes[1].childNodes[2].childNodes[3].childNodes;
        for (var i = 0; i < topPanelChildNodes.length; i++) {
            var cell = topPanelChildNodes[i];
            var cellInfo = window.GridBase.getCellInfo(cell);
            if (parseInt(cellInfo[0]) == parseInt(colIndex) && parseInt(cellInfo[1]) == parseInt(rowIndex)) {
                return true;
            }
        }
        return false;
    }
};

window.GridColumnHeaderCell = {
    init: function (optionsElemRef, optionsMenuVisibility, isOptionsDropDownOpen) {
        window.GridColumnHeaderCell.invalidateOptionsMenuVisibilityBehaviour(optionsElemRef, optionsMenuVisibility, isOptionsDropDownOpen);
    },

    invalidateOptionsMenuVisibilityBehaviour: function (optionsElemRef, optionsMenuVisibility, isOptionsDropDownOpen) {
        var hitarea = optionsElemRef.parentElement;
        hitarea.onpointerenter = null;
        hitarea.onpointerleave = null;

        // Match options with c# GridColumnOptionsMenuVisibility enum's values.
        var Options = { auto: "auto", mouseover: "mouseover", visible: "visible", collapsed: "collapsed" };

        var option = optionsMenuVisibility.toLowerCase();
        if (option == Options.auto) {
            var media = window.matchMedia("(hover: hover)");
            option = media.matches ? Options.mouseover : Options.visible;
        }
        
        switch (option) {

            case Options.collapsed: 
                optionsElemRef.style.display = 'none';
                break;

            case Options.visible:
                optionsElemRef.style.display = 'block';
                break;

            case Options.mouseover:
                if (isOptionsDropDownOpen) {
                    optionsElemRef.style.display = 'block';
                    return;
                }
                optionsElemRef.style.removeProperty("display");
                // This case manages via css <.flexgrid-cell:hover> style. Reason: reducing custom js functionality for tracking pointer's coordinates.
                break;
        }
    },
}

class FlexGridDragDropManager extends DragDropManager {
    constructor(target) {
        super(target);
    }
}