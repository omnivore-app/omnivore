// Package server groups all "omnivore server <service>" subcommands.
package server

import (
	"github.com/spf13/cobra"
)

// Cmd is the "omnivore server" parent command.
var Cmd = &cobra.Command{
	Use:   "server",
	Short: "Start an Omnivore service",
	Long:  `Start one of the Omnivore backend services.`,
}

func init() {
	Cmd.AddCommand(contentFetcherCmd)
}
