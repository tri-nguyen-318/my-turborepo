package middleware

import (
	"net/http"
	"strings"
)

// SwaggerHostRewrite rewrites the Swagger host based on the actual request host
func SwaggerHostRewrite(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only intercept Swagger JSON responses
		if strings.HasSuffix(r.URL.Path, "/swagger.json") {
			wrappedWriter := &swaggerResponseWriter{
				ResponseWriter: w,
				host:           r.Host,
			}

			next.ServeHTTP(wrappedWriter, r)
			return
		}

		next.ServeHTTP(w, r)
	})
}

type swaggerResponseWriter struct {
	http.ResponseWriter
	host string
}

func (w *swaggerResponseWriter) Write(b []byte) (int, error) {
	// Replace localhost:8080 with actual host
	content := string(b)
	content = strings.ReplaceAll(content, "localhost:8080", w.host)
	return w.ResponseWriter.Write([]byte(content))
}
