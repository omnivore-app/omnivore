package app.omnivore.omnivore.core.data


import java.security.SecureRandom
import java.util.*
import kotlin.math.abs
import kotlin.math.ceil

/**
 * NanoId is a utility object providing functions for generating secure, URL-friendly, unique identifiers.
 *
 * The object offers methods for generating random strings with adjustable parameters like size, alphabet,
 * overhead factor, and a custom random number generator.
 *
 * Example usage:
 * ```
 * val id = NanoId.generate()
 * ```
 */
object NanoId {

    /**
     * Generates a random string based on specified or default parameters.
     *
     * @param size The desired length of the generated string. Default is 21.
     * @param alphabet The set of characters to choose from for generating the string. Default includes alphanumeric characters along with "_" and "-".
     * @param additionalBytesFactor The additional bytes factor used for calculating the step size. Default is 1.6.
     * @param random The random number generator to use. Default is `SecureRandom`.
     * @return The generated random string.
     * @throws IllegalArgumentException if the alphabet is empty or larger than 255 characters, or if the size is not greater than zero.
     */
    @JvmOverloads
    fun generate(
        size: Int = 21,
        alphabet: String = "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        additionalBytesFactor: Double = 1.6,
        random: Random = SecureRandom()
    ): String {
        require(!(alphabet.isEmpty() || alphabet.length >= 256)) { "alphabet must contain between 1 and 255 symbols." }
        require(size > 0) { "size must be greater than zero." }
        require(additionalBytesFactor >= 1) { "additionalBytesFactor must be greater or equal 1." }

        val mask = calculateMask(alphabet)
        val step = calculateStep(size, alphabet, additionalBytesFactor)

        return generateOptimized(size, alphabet, mask, step, random)
    }

    /**
     * Generates an optimized random string of a specified size using the given alphabet, mask, and step.
     * Optionally, you can specify a custom random number generator. This optimized version is designed for
     * higher performance and lower memory overhead.
     *
     * @param size The desired length of the generated string.
     * @param alphabet The set of characters to choose from for generating the string.
     * @param mask The mask used for mapping random bytes to alphabet indices. Should be `(2^n) - 1` where `n` is a power of 2 less than or equal to the alphabet size.
     * @param step The number of random bytes to generate in each iteration. A larger value may speed up the function but increase memory usage.
     * @param random The random number generator. Default is `SecureRandom`.
     * @return The generated optimized string.
     */
    @JvmOverloads
    fun generateOptimized(size: Int, alphabet: String, mask: Int, step: Int, random: Random = SecureRandom()): String {
        val idBuilder = StringBuilder(size)
        val bytes = ByteArray(step)
        while (true) {
            random.nextBytes(bytes)
            for (i in 0 until step) {
                val alphabetIndex = bytes[i].toInt() and mask
                if (alphabetIndex < alphabet.length) {
                    idBuilder.append(alphabet[alphabetIndex])
                    if (idBuilder.length == size) {
                        return idBuilder.toString()
                    }
                }
            }
        }
    }

    /**
     * Calculates the optimal additional bytes factor needed for the generation of the step size, which is used to generate random bytes in each iteration.
     *
     * @param alphabet The set of characters to use for generating the string.
     * @return The additional bytes factor, rounded to two decimal places.
     */
    private fun calculateAdditionalBytesFactor(alphabet: String): Double {
        val mask = calculateMask(alphabet)
        return (1 + abs((mask - alphabet.length.toDouble()) / alphabet.length)).round(2)
    }

    /**
     * Calculates the mask used to map random bytes to indices in the alphabet.
     *
     * @param alphabet The set of characters to use for generating the string.
     * @return The calculated mask value.
     */
    private fun calculateMask(alphabet: String) = (2 shl (Integer.SIZE - 1 - Integer.numberOfLeadingZeros(alphabet.length - 1))) - 1

    /**
     * Calculates the number of random bytes to generate in each iteration for a given size and alphabet.
     *
     * @param size The length of the generated string.
     * @param alphabet The set of characters to use for generating the string.
     * @param additionalBytesFactor The additional bytes factor. Default value is calculated using `calculateAdditionalBytesFactor()`.
     * @return The number of random bytes to generate in each iteration.
     */
    @JvmOverloads
    fun calculateStep(size: Int, alphabet: String, additionalBytesFactor: Double = calculateAdditionalBytesFactor(alphabet)) =
        ceil(additionalBytesFactor * calculateMask(alphabet) * size / alphabet.length).toInt()

    @JvmSynthetic
    internal fun Double.round(decimals: Int): Double {
        var multiplier = 1.0
        repeat(decimals) { multiplier *= 10 }
        return kotlin.math.round(this * multiplier) / multiplier
    }
}
