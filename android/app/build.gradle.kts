import java.util.Properties

plugins {
    id("com.android.application")
}

// Signing details live in keystore.properties (not committed). Without it the release build is unsigned.
val signing = Properties().apply {
    val f = rootProject.file("keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

android {
    namespace = "app.getbloc"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "app.getbloc"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0 demo"
    }

    signingConfigs {
        if (signing.isNotEmpty()) create("release") {
            storeFile = rootProject.file(signing.getProperty("storeFile"))
            storePassword = signing.getProperty("storePassword")
            keyAlias = signing.getProperty("keyAlias")
            keyPassword = signing.getProperty("keyPassword")
        }
    }

    buildTypes {
        release {
            optimization {
                enable = false
            }
            if (signing.isNotEmpty()) signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}
