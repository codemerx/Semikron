window.C1Menu = {
    /**
     * Initialize menu item view element.
     * @param element Div container reference
     * @param component Component reference.
     */
    initMenuItemView: function (element, component) {
        element.menuItemViewInstance = {
            dispose: function() {
                element.removeEventListener("pointerenter", onPointerEnter);
                element.removeEventListener("pointerleave", onPointerLeave);
                element.menuItemViewInstance = null;
            }
        };
        element.addEventListener("pointerenter", onPointerEnter);
        element.addEventListener("pointerleave", onPointerLeave);
        
        function onPointerEnter() {
            component.invokeMethodAsync("OnMouseEnter").catch(() => {});
        }
        function onPointerLeave() {
            component.invokeMethodAsync("OnMouseLeave").catch(() => { });   ;
        }
    },

    dispose: function (element) {
        if (element.menuItemViewInstance) {
            element.menuItemViewInstance.dispose();
        }
    }
};