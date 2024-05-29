# digest-score

The digest-score is the result of calculating the user's `interaction_score` which is how likely it is the user opens the library_item.

## Creating features

Currently the features are materialized views created in the public schema. Before moving to production we should create a `features` schema. To create all the materialized views locally run the `create-features.sql` file with the psql command:

`psql omnivore -f create_feature_views.sql`

## Training

Currently we create a small random forest model, when running locally this will be saved to disk during training. The reason we use such a simple model is to focus on feature development. The model is mostly a guide to understand whether or not the features are relevant.

To train the data run the following command:

`NUM_DAYS_HISTORY=1000 SAMPLE_SIZE=100 python train.py`

This will create a file: `predict_user_clicked_random_forest_pipeline-v001.pkl`

## Running the service

Now that there is a model created, you can run the service using the following command:

`LOAD_LOCAL_MODEL=true python app.py`

To test the model make a curl request using your user id, for example:

### A single prediction

```
curl -d '{ "user_id": "2da52794-0dd2-11ef-9855-5f368b90f676", "item_features": { "site": "Omnivore Blog", "title": "this is a title", "author": "Tiago Forte", "subscription": "this is a subscriptionsdfsdfsdf", "has_thumbnail": true, "has_site_icon": true, "saved_at": "2024-05-27T04:20:47Z" }}' -H 'Content-Type: application/json' localhost:5000/predict
```

### A batch prediction

curl -d '{ "user_id": "2da52794-0dd2-11ef-9855-5f368b90f676", "items": { "134f883e-efd8-11ee-ae98-532a6874855a": { "library_item_id": "134f883e-efd8-11ee-ae98-532a6874855a", "site": "TikTok", "title": "this is a title", "author": "Tiago Forte", "subscription": "this is a subscriptionsdfsdfsdf", "has_thumbnail": true, "has_site_icon": true, "saved_at": "2024-05-27T04:20:47Z" }} }' -H 'Content-Type: application/json' localhost:5000/batch

### Make a prediction for a given user and library_item (for debugging only)

```
curl localhost:5000/users/2da52794-0dd2-11ef-9855-5f368b90f676/library_items/134f883e-efd8-11ee-ae98-532a6874855a/score
{
  "score": {
    "score": 0.8,
    "interaction_score": 1.0,
  }
}
```

### Print the user's profile data (for debugging only)

```
curl localhost:5000/users/2da52794-0dd2-11ef-9855-5f368b90f676/features
{
  "user_30d_interactions_site": {
    "count": [
      {
        "site": "TikTok",
        "user_30d_interactions_site_count": 3
      }
    ],
    "rate": [
      {
        "site": "TikTok",
        "user_30d_interactions_site_rate": 0.75
      }
    ]
  }
}
```
