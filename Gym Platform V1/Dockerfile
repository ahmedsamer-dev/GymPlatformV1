# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["Gym_Platform_V1.csproj", "./"]
RUN dotnet restore "Gym_Platform_V1.csproj"

# Copy the rest of the source code
COPY . .

# Build and publish the application
RUN dotnet publish "Gym_Platform_V1.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false


# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Render will expose port 10000
ENV ASPNETCORE_URLS=http://+:10000

COPY --from=build /app/publish .

EXPOSE 10000

ENTRYPOINT ["dotnet", "Gym_Platform_V1.dll"]
