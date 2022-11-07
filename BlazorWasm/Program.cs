using BlazorWasm;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using SharedLibrary.Data;
using Syncfusion.Blazor;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

builder.Services.AddScoped<CommentService>();
builder.Services.AddScoped<PostService>();

builder.Services.AddTransient<CommentAdaptor>();

builder.Services.AddTelerikBlazor();
builder.Services.AddSyncfusionBlazor();

await builder.Build().RunAsync();
