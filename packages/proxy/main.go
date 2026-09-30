package main

import (
	"io"
	"log"
	"maps"
	"time"

	http "github.com/bogdanfinn/fhttp"
	tlsclient "github.com/bogdanfinn/tls-client"
	"github.com/bogdanfinn/tls-client/profiles"
)

var client tlsclient.HttpClient

func init() {
	var err error
	options := []tlsclient.HttpClientOption{
		tlsclient.WithTimeoutSeconds(30),
		tlsclient.WithClientProfile(profiles.Chrome_152),
	}

	client, err = tlsclient.NewHttpClient(tlsclient.NewNoopLogger(), options...)

	if err != nil {
		log.Fatalf("tls-client init: %v", err)
	}
}

func proxy(w http.ResponseWriter, r *http.Request) {
	target := r.Header.Get("X-Target-Url")

	req, _ := http.NewRequest("GET", target, nil)

	maps.Copy(r.Header, req.Header)
	req.Header.Del("X-Target-Url")

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "upstream: "+err.Error(), 502)
		return
	}
	defer resp.Body.Close()

	maps.Copy(w.Header(), resp.Header)
	// We send back uncompressed, so we remove the content-encoding.
	w.Header().Del("Content-Encoding")
	w.WriteHeader(resp.StatusCode)

	_, err = io.Copy(w, resp.Body)
	if err != nil {
		http.Error(w, "upstream: "+err.Error(), 502)
		return
	}
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", proxy)
	srv := &http.Server{Addr: ":8787", Handler: mux, ReadTimeout: 10 * time.Second}
	log.Println("tls-client proxy on :8787")
	log.Fatal(srv.ListenAndServe())
}
