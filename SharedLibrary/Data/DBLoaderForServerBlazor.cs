using System.Net.Http.Json;
using System.Text.Json;

namespace SharedLibrary.Data
{
    public class DBLoaderForServerBlazor : Database
    {
        protected override async Task<DbModel> ReadData()
        {
            var filePath = Path.Combine("..", "SharedLibrary", "wwwroot", "db.json");

            using (FileStream stream = File.OpenRead(filePath))
            {
                var opt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return await JsonSerializer.DeserializeAsync<DbModel>(stream, opt) ?? new DbModel();
            }
        }
    }
}