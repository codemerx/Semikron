
namespace blazor_component_test.Data
{
    public class PostService
    {
        private readonly HttpClient httpClient;

        public PostService(HttpClient httpClient)
        {
            this.httpClient = httpClient;
        }

        public async Task<ServiceResponse<Post>> GetPostsAsync(ServiceRequest req)
        {
            var res = await httpClient.GetAsync($"https://jsonplaceholder.typicode.com/posts?_page={req.Page}&_limit={req.Limit}");

            return await GetResponse(res);
        }

        private static async Task<ServiceResponse<Post>> GetResponse(HttpResponseMessage res)
        {

            return new ServiceResponse<Post>
            {
                Total = Int32.Parse(res.Headers.GetValues("x-total-count").FirstOrDefault("0")),
                Data = await res.Content.ReadFromJsonAsync<Post[]>() ?? Array.Empty<Post>(),
            };
        }
    }

    public class Post
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
    }
}