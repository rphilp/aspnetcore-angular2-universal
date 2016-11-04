using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Angular2Spa
{

    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();

                // Webpack middleware setup
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions {
                    HotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseWebSockets();

            app.Use(async (context, next) =>
            {
                if (context.WebSockets.IsWebSocketRequest)
                {
                    var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                    await Echo(context, webSocket, loggerFactory.CreateLogger("Echo"));
                }
                else
                {
                    await next();
                }
            });

            //  ** Setup Websockets **
            // app.Map("/ws", WebSocketHandler.Map);



            //  ** MVC / WebAPI Routing & default SPA fallback Routing
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new { controller = "Home", action = "Index" });
            });
        }

        public class WebSocketEventMessage
        {
            public string ACTION { get; set; }
            public object PAYLOAD { get; set; }

        }

        private async Task Echo(HttpContext context, WebSocket webSocket, ILogger logger)
        {
            var buffer = new byte[1024 * 4];

            WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            
            LogFrame(logger, result, buffer);
            while (!result.CloseStatus.HasValue)
            {
                // If the client send "ServerClose", then they want a server-originated close to occur
                string content = "<<binary>>";
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    content = Encoding.UTF8.GetString(buffer, 0, result.Count);

                    var serializedData = JsonConvert.DeserializeObject<WebSocketEventMessage>(content);

                    var returnedData = JsonConvert.SerializeObject(EventingSystem(serializedData));
                    var outputBuffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(returnedData));

                    await webSocket.SendAsync(outputBuffer, WebSocketMessageType.Text, true, CancellationToken.None);

                    // await webSocket.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);

                    //if (content.Equals("ServerClose"))
                    //{
                    //    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing from Server", CancellationToken.None);
                    //    logger.LogDebug($"Sent Frame Close: {WebSocketCloseStatus.NormalClosure} Closing from Server");
                    //    return;
                    //}
                    //else if (content.Equals("ServerAbort"))
                    //{
                    //    context.Abort();
                    //}
                }

                //await webSocket.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);
                logger.LogDebug($"Sent Frame {result.MessageType}: Len={result.Count}, Fin={result.EndOfMessage}: {content}");

                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                LogFrame(logger, result, buffer);
            }

            await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }

        private string EventingSystem (WebSocketEventMessage serializedData)
        {
            switch (serializedData.ACTION)
            {
                case "TEST_ACTION":
                    return "Testing some return";
                default:
                    return "";
            }
        }


        private void LogFrame(ILogger logger, WebSocketReceiveResult frame, byte[] buffer)
        {
            var close = frame.CloseStatus != null;
            string message;
            if (close)
            {
                message = $"Close: {frame.CloseStatus.Value} {frame.CloseStatusDescription}";
            }
            else
            {
                string content = "<<binary>>";
                if (frame.MessageType == WebSocketMessageType.Text)
                {
                    content = Encoding.UTF8.GetString(buffer, 0, frame.Count);
                }
                message = $"{frame.MessageType}: Len={frame.Count}, Fin={frame.EndOfMessage}: {content}";
            }
            logger.LogDebug("Received Frame " + message);
        }
    }
}