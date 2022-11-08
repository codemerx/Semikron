using System.Net.Http.Json;

namespace SharedLibrary.Data
{
    public class DBLoaderForWasm : Database
    {
        private readonly HttpClient httpClient;

        public DBLoaderForWasm(HttpClient httpClient)
        {
            this.httpClient = httpClient;
        }

        protected override async Task<DbModel> ReadData()
        {
            return await httpClient.GetFromJsonAsync<DbModel>("_content/SharedLibrary/db.json") ?? new DbModel();
        }
    }
}