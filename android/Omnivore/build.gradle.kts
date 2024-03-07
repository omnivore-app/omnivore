buildscript {

    dependencies {
        classpath(libs.android.hilt)
        classpath(libs.android.gradlePlugin)
        classpath(libs.kotlin.gradlePlugin)
    }

    repositories {
        mavenCentral()
        google()
    }
}

plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.ksp) apply false
}

task<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
