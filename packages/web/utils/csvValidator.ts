import CSVFileValidator, { ValidatorConfig } from 'csv-file-validator'
import dayjs from 'dayjs'

const isUrlValid = (url: string | number | boolean) => {
  if (typeof url !== 'string') {
    return false
  }

  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

const isStateValid = (state: string | number | boolean) => {
  if (typeof state !== 'string') {
    return false
  }

  const validStates = ['SUCCEEDED', 'ARCHIVED']
  return validStates.includes(state.toUpperCase())
}

const isDateValid = (date: string | number | boolean) => {
  const dateString = date.toString()
  // date is unix timestamp in milliseconds
  if (dateString.length !== 13) {
    return false
  }

  const timestamp = parseInt(dateString, 10)
  if (isNaN(timestamp)) {
    return false
  }

  return dayjs(timestamp).isValid()
}

const csvConfig: ValidatorConfig = {
  headers: [
    {
      name: 'url',
      inputName: 'url',
      required: true,
      unique: true,
      validate: function (url) {
        return isUrlValid(url)
      },
    },
    {
      name: 'state',
      inputName: 'state',
      required: false,
      optional: true,
      validate: function (state) {
        if (!state) {
          return true
        }
        return isStateValid(state)
      },
    },
    {
      name: 'labels',
      inputName: 'labels',
      required: false,
      optional: true,
      isArray: true,
    },
    {
      name: 'saved_at',
      inputName: 'saved_at',
      required: false,
      optional: true,
      validate: function (date) {
        if (!date) {
          return true
        }

        return isDateValid(date)
      },
    },
    {
      name: 'published_at',
      inputName: 'published_at',
      required: false,
      optional: true,
      validate: function (date) {
        if (!date) {
          return true
        }

        return isDateValid(date)
      },
    },
  ],
}

export const validateCsvFile = async (
  file: string | File | NodeJS.ReadableStream
) => {
  // validate csv file
  return CSVFileValidator(file, csvConfig)
}
