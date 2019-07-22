package main

import (
	"log"

	"github.com/kpr6/gomusic/backend/src/rest"
)

func main() {
	log.Println("Main log....")
	log.Fatal(rest.RunAPI("127.0.0.1:8080"))
}
