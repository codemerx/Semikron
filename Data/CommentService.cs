namespace blazor_component_test.Data
{
    public class CommentService
    {
        private readonly HttpClient httpClient;

        public CommentService(HttpClient httpClient)
        {
            this.httpClient = httpClient;
        }

        public async Task<ServiceResponse<Comment>> GetCommentsAsync(ServiceRequest req)
        {
            var res = await httpClient.GetAsync($"https://jsonplaceholder.typicode.com/comments?_page={req.Page}&_limit={req.Limit}");

            return await GetResponse(res);
        }

        public async Task<ServiceResponse<Comment>> GetRepeatedCommentsAsync(int count, ServiceRequest req)
        {
            var res = await GetCommentsAsync(req);

            res.Total = count * res.Total;
            res.Data = Repeat(count, res.Data);

            return res;
        }

        private Comment[] Repeat(int count, Comment[] dataToRepeat)
        {
            var res = new Comment[dataToRepeat.Length * count];

            for (int i = 0; i < res.Length; i++)
            {
                res[i] = (Comment)dataToRepeat[i % dataToRepeat.Length].Clone();
                res[i].RowNumber = i;
            }

            return res;
        }


        public async Task<ServiceResponse<Comment>> GetCommentsByPostIdAsync(int postId, ServiceRequest req)
        {
            var res = await httpClient.GetAsync($"https://jsonplaceholder.typicode.com/comments?postId={postId}&_page={req.Page}&_limit={req.Limit}");
            return await GetResponse(res);
        }

        private static async Task<ServiceResponse<Comment>> GetResponse(HttpResponseMessage res)
        {

            return new ServiceResponse<Comment>
            {
                Total = Int32.Parse(res.Headers.GetValues("x-total-count").FirstOrDefault("0")),
                Data = await res.Content.ReadFromJsonAsync<Comment[]>() ?? Array.Empty<Comment>(),
            };
        }
    }

    public class Comment : ICloneable
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public int RowNumber { get; set; }
        public string Body { get; set; }

        public object Clone()
        {
            return new Comment
            {
                Id = Id,
                RowNumber = RowNumber,
                Email = Email,
                Name = Name,
                PostId = PostId
            };
        }
    }
}
