FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ProjectManager.csproj", "."]
RUN dotnet restore "ProjectManager.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "ProjectManager.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ProjectManager.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
RUN mkdir -p /app/data
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "ProjectManager.dll"]
