# Semikron

## Blazor component library comparison matrix

||Telerik|Syncfusion|
|-|-|-|
|Data grid server-side pagination|:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark: [^syncfusion_pagination]|
|Data grid server-side filtering|:heavy_check_mark:/:heavy_check_mark:||
|Data grid server-side sorting|:heavy_check_mark:/:heavy_check_mark:||
|Data grid virtualization|:heavy_check_mark:/:heavy_check_mark: [^telerik_virtualization]||
|Data grid hierarchy [^hierarchy]|:heavy_check_mark:/:heavy_check_mark:||
|Tree grid server-side pagination|:x:/:x: [^telerik_tree_grid]||
|Tree grid server-side filtering|:x:/:x:||
|Tree grid server-side sorting|:x:/:x:||
|Tree grid virtualization|:x:/:x:||
|Line chart|:heavy_check_mark:/:heavy_check_mark:||
|Area chart|:heavy_check_mark:/:heavy_check_mark:||
|Bar chart|:heavy_check_mark:/:heavy_check_mark:||
|Stacked bar chart|:heavy_check_mark:/:heavy_check_mark:||
|Notes|[^telerik]|[^syncfusion]|

Legend:
- :heavy_check_mark: = works
- :x: = doesn't work
- :heavy_check_mark:/:x: = Blazor Server/Blazor WebAssembly

[^hierarchy]: the ability to expand every row and have custom components inside
[^telerik_virtualization]: Does not work with pagination. Has browser height limit.
[^telerik_tree_grid]: Expects data from parameters. Has no parameter like **OnRead** EventCallback.
[^telerik_tree_grid_virtualization]: Has only column (horizontally)
[^telerik]: Put notes here
[^syncfusion]: It has separate nuget package for each component. Can be good for wasm project.
[^syncfusion_pagination]: Has build-in loading animation
