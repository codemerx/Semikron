# Semikron

## Blazor component library comparison matrix

||Telerik|Syncfusion|GrapeCity/C1|Infragistics|DevExpress|
|-|-|-|-|-|-|
|Data grid server-side pagination/sorting/filtering/grouping|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:interrobang: [^c1_grid_group_ui], [^c1_grid_implementation], [^c1_grid_group_problem]|:x:/:x:/:x:/:x:|
|Data grid client-side pagination/sorting/filtering/grouping|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:interrobang: [^c1_grid_group_ui], [^c1_grid_implementation], [^c1_grid_group_problem]|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark: [^infragistics_grid_data_size_limit]|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark: [^devexpress_grid_filter_operators]|
|Data grid virtualization|:heavy_check_mark: [^telerik_virtualization], [^virtualization_limits]|:heavy_check_mark: [^virtualization_limits], [^syncfusion_virtualization]|:heavy_check_mark: [^virtualization_limits]|:heavy_check_mark: [^infragistics_grid_data_size_limit]|:heavy_check_mark: [^virtualization_limits], [^devexpress_grid_virt_versions]|
|Data grid hierarchy [^hierarchy]|:heavy_check_mark:|:heavy_check_mark:|:heavy_check_mark:|:x: [^infragistics_grid_hierarchy]|
|Tree grid server-side pagination/sorting/filtering|:x:/:x:/:x: [^telerik_tree_grid_info], [^telerik_tree_grid]|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark: [^syncfusion_tree_grid_server_side]|:x:/:x:/:x: [^no_tree_grid]|:x:/:x:/:x:/:x:|
|Tree grid client-side pagination/sorting/filtering|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:x:/:x:/:x: [^no_tree_grid]|:interrobang:/:interrobang:/:interrobang: [^infragistics_tree_grid_server_blazor]|
|Tree grid virtualization|:x: [^telerik_tree_grid_virtualization]|:heavy_check_mark:|:x: [^no_tree_grid]|:interrobang: [^infragistics_tree_grid_server_blazor]|
|Charts Line/Area/Bar/Stacked Bar/Combined|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark: [^syncfusion_chart_overlap_problem]|:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark:/:heavy_check_mark: [^c1_chart_overlap_problem], [^c1_chart_area_no_tooltip]|:interrobang:/:interrobang:/:interrobang:/:interrobang:/:interrobang: [^infragistics_charts_dont_work]|
|Notes||[^syncfusion]|[^c1_bad_docs], [^c1_static_file_problem], [^c1_wasm_performance_problem]|[^infragistics_lang_problem]|

Legend:
- :heavy_check_mark: = works
- :x: = doesn't work
- :interrobang: = Works but has problems

[^hierarchy]: the ability to expand every row and have custom components inside
[^no_tree_grid]: It doesn't have a tree grid
[^telerik_virtualization]: Does not work with pagination. OnRead does not work properly with virtualization.
[^virtualization_limits]: Has a browser height limit.
[^telerik_tree_grid_info]: The name is **TreeList** in Telerik components
[^telerik_tree_grid]: Expects data from parameters. Has no parameter like **OnRead** EventCallback.
[^telerik_tree_grid_virtualization]: Has only column (horizontally) virtualization
[^syncfusion]: It has a separate NuGet package for each component. Can be good for the wasm project.
[^syncfusion_virtualization]: Also works with server-side pagination. It loads data while scrolling. But has problems like does not load the last 10-20 items.
[^syncfusion_tree_grid_server_side]: The document says, with CustomDataManager only Self-Referential(Flat) type data is supported. Hierarchical data has limited customizations.
[^syncfusion_chart_overlap_problem]: Charts can hide each other when overlap. Changing opacity solves the problem. This overlapping sometimes can cause a tooltip problem (hovering does not work). Changing the drawing order can solve the problem.
[^c1_chart_overlap_problem]: Overlapping sometimes can cause a tooltip problem (hovering does not work). Changing the drawing order can solve the problem.
[^c1_chart_area_no_tooltip]: The area chart doesn't have a tooltip.
[^c1_grid_group_ui]: It has not built-in grouping UI. Can be triggered from code.
[^c1_grid_group_problem]: Grouping with pagination/virtualization has not worked for me.
[^c1_bad_docs]: Documents are not detailed.
[^c1_grid_implementation]: Combining the functionalities requires extra code. For example paging and sorting.
[^c1_static_file_problem]: Static files (CSS, js) do not load when used with Razor Class Library.
[^c1_wasm_performance_problem]: Grid expanding and menus have a performance problem in Wasm.
[^infragistics_lang_problem]: It has a language problem. Some non-English languages could cause DataGrid loading problems.
[^infragistics_grid_data_size_limit]: Unable to load too many items (in my tests, it can't load 1,000,000 items but it can load 900,000 items).
[^infragistics_grid_hierarchy]: Angular and ASP.NET versions have grid hierarchies. Probably the Blazor version will come soon.
[^infragistics_tree_grid_server_blazor]: Has errors on the server side Blazor. But it works in Wasm.
[^infragistics_charts_dont_work]: Chart examples in the documents work, but in this project do not work.
[^devexpress_grid_filter_operators]: Default UI provides a single filter operator. It has templating API for custom filtering UI.
[^devexpress_grid_virt_versions]: They are migrating to a new grid component. The old version supports virtualization but the new one doesn't. [Grid migration docs.](https://docs.devexpress.com/Blazor/403162/grid/migrate-from-data-grid-to-grid)
