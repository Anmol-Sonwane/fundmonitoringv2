FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["fundmonitoring/fundmonitoring.csproj", "fundmonitoring/"]
RUN dotnet restore "fundmonitoring/fundmonitoring.csproj"

COPY . .
WORKDIR /src/fundmonitoring
RUN dotnet publish "fundmonitoring.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .
RUN mkdir -p /app/wwwroot/uploads

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "fundmonitoring.dll"]
