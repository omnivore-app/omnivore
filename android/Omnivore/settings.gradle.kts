pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://customers.pspdfkit.com/maven")
        }
        maven(url = "https://jitpack.io")
    }
}
rootProject.name = "Omnivore"
include(":app")
