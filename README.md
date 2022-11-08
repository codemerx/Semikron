# Semikron

## Blazor component library comparison matrix

||Telerik|Syncfusion|
|-|-|-|
|Data grid server-side pagination/sorting/filtering/grouping|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|
|Data grid client-side pagination/sorting/filtering/grouping|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|
|Data grid virtualization|:heavy_check_mark: [^telerik_virtualization], [^virtualization_limits]|:heavy_check_mark: [^virtualization_limits], [^syncfusion_virtualization]|
|Data grid hierarchy [^hierarchy]|:heavy_check_mark:|:heavy_check_mark:|
|Tree grid server-side pagination/sorting/filtering|:x:/:x:/:x: [^telerik_tree_grid_info], [^telerik_tree_grid]|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark: [^syncfusion_tree_grid_server_side]|
|Tree grid client-side pagination/sorting/filtering|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|
|Tree grid virtualization|:x: [^telerik_tree_grid_virtualization]|:heavy_check_mark:|
|Charts Line/Area/Bar/Stacked Bar/Combined|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark: [^syncfusion_chart_overlap_problem]|
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
[^syncfusion_virtualization]: Also works with server side pagination. It loads data while scrolling. But has problem like does not load last 10-20 items.
[^syncfusion_tree_grid_server_side]: Document says, with CustomDataManager only Self-Referential(Flat) type data is supported. Hierarchical data has limited customizations.
[^syncfusion_chart_overlap_problem]: Charts can be hide each other when overlaps. Changing opacity solves the problem. This overlapping sometimes can cause tooltip problem (hovering does not work). Changing the drawing order can be solves problem.
