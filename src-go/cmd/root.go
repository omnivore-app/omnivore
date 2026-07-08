package cmd

import (
	"os"

	"github.com/omnivore-app/omnivore/cmd/server"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "omnivore",
	Short: "Omnivore – open-source read-it-later platform",
	Long: `omnivore is the single binary for running Omnivore services.

Available commands:
  omnivore server content-fetcher   Start the content-fetch worker and HTTP server`,
}

func init() {
	rootCmd.AddCommand(server.Cmd)
}

// Execute runs the root command. Called by main().
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}
