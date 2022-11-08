# Semikron

## Blazor component library comparison matrix

||Telerik|Syncfusion|
|-|-|-|
|Data grid server-side pagination/sorting/filtering/grouping|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|
|Data grid client-side pagination/sorting/filtering/grouping|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|
|Data grid server-side pagination|:heavy_check_mark:|:heavy_check_mark:|
|Data grid server-side filtering|:heavy_check_mark:|:heavy_check_mark:|
|Data grid server-side sorting|:heavy_check_mark:|:heavy_check_mark:|
|Data grid virtualization|:heavy_check_mark: [^telerik_virtualization], [^virtualization_limits]|:heavy_check_mark: [^syncfusion_virtualization], [^virtualization_limits]|
|Data grid hierarchy [^hierarchy]|:heavy_check_mark:|:heavy_check_mark:|
|Tree grid server-side pagination|:x: [^telerik_tree_grid_info], [^telerik_tree_grid]|:heavy_check_mark: [^syncfusion_tree_grid_server_side]|
|Tree grid server-side filtering|:x:|:heavy_check_mark:|
|Tree grid server-side sorting|:x:|:heavy_check_mark:|
|Tree grid virtualization|:x: [^telerik_tree_grid_virtualization]|:heavy_check_mark:|
|Line chart|:heavy_check_mark:|:heavy_check_mark:|
|Area chart|:heavy_check_mark:|:heavy_check_mark:|
|Bar chart|:heavy_check_mark:|:heavy_check_mark:|
|Stacked bar chart|:heavy_check_mark:|:heavy_check_mark:|
|Notes||[^syncfusion]|

Legend:
- :heavy_check_mark: = works
- :x: = doesn't work

[^hierarchy]: the ability to expand every row and have custom components inside
[^telerik_virtualization]: Does not work with pagination. OnRead does not work properly with virtualization.
[^virtualization_limits]: Has browser height limit.
[^telerik_tree_grid_info]: The name is **TreeList** in telerik components
[^telerik_tree_grid]: Expects data from parameters. Has no parameter like **OnRead** EventCallback.
[^telerik_tree_grid_virtualization]: Has only column (horizontally) virtualization
[^syncfusion]: It has separate nuget package for each component. Can be good for wasm project.
[^syncfusion_virtualization]: Also works with server side pagination. It loads data while scrolling. But has problem like does not load last 10-20 items. Can be has solution.
[^syncfusion_tree_grid_server_side]: Document says, with CustomDataManager only Self-Referential(Flat) type data is supported. Hierarchical data has limited customizations.
