function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Handle Next.js static files
    if (uri.startsWith('/_next/')) {
        request.uri = uri;
        return request;
    }
    
    // Handle root path
    if (uri === '/') {
        request.uri = '/index.html';
        return request;
    }
    
    // Handle other paths
    if (!uri.includes('.')) {
        request.uri = uri + '.html';
    }
    
    return request;
}
