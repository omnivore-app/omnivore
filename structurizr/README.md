# Structurizr Architecture Documentation

This directory contains the C4 model architecture documentation for the Omnivore platform using Structurizr Lite.

## Files

- `workspace.dsl` - The main DSL file defining the C4 model
- `workspace.json` - Workspace configuration (auto-generated)

## Running Structurizr

The Structurizr Lite service is included in the main Docker Compose setup:

```bash
# Start all services including Structurizr
docker-compose up -d

# Or start just Structurizr
docker-compose up structurizr
```

Once running, access the Structurizr web interface at: http://localhost:8080

## Architecture Views

The DSL file defines several views:

1. **System Context** - Shows how users interact with Omnivore and external systems
2. **Container View** - Shows the internal containers/services within Omnivore
3. **Styling** - Custom colors and themes for professional diagrams

## Editing the Architecture

1. Edit the `workspace.dsl` file in this directory
2. Refresh the browser page to see changes (Structurizr Lite auto-reloads)
3. Export diagrams as needed for documentation

## DSL Structure

The workspace follows the standard C4 model structure:

```
workspace {
  model {
    // People and systems
    // Relationships
  }
  views {
    // Diagram definitions
    // Styling
  }
}
```

## Integration with Documentation

This architecture documentation integrates with the main documentation in `docs/architecture/`:

- `c4-context.dsl` - Source of truth (this file)
- `c4-context.md` - Human-readable documentation
- `c4-context.puml` - PlantUML version (if needed)

## Tips

- Use `autoLayout` for automatic positioning
- Add `animation` blocks to show progressive disclosure
- Use `theme default` or custom styling for consistency
- Export views as PNG/SVG for inclusion in other documentation
