import express from "express";
import mongoose from "mongoose";
import Category from "@/model/Category.js";

const categoriesRouter = express.Router();


categoriesRouter.post("/", async (req, res, next) => {
    const { title } = req.body;
    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).send({error: 'Title is required'});
    }

    try {
        const newCategory = new Category({ title: title.trim() });
        await newCategory.save();
        return res.send(newCategory);
    } catch(e) {
        if (e instanceof mongoose.Error.ValidationError) {
            return res.status(400).send({
                error_code: "VALIDATION_ERROR",
                details: e.errors,
            });
        }

        if (e instanceof mongoose.mongo.MongoServerError && e.code === 11000) {
            return res.status(409).send({
                error_code: "DUPLICATE_CATEGORY_TITLE",
                error: "Category title already exists",
            });
        }
        next(e);
    }
});

categoriesRouter.get('/', async (req, res, next) => {
    const result = await Category.find();
    return res.send(result);
});


categoriesRouter.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  const isValidId = mongoose.Types.ObjectId.isValid(id);

  if (!id || !isValidId) {
    return res.status(400).send({ error: 'Invalid ID' });
  }

  try {
    const category = await Category.findById(id);
    if (!category) return res.status(400).send({error: 'Category not found'});

    category.isPublished = !category.isPublished;
    await category.save();
    return res.send(category);

  } catch (e) {
    console.log(e);
    next(e);
  }
});

categoriesRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  const isValidId = mongoose.Types.ObjectId.isValid(id);

  if (!id || !isValidId) {
    return res.status(400).send({ error: 'Invalid ID' });
  }

  try {
    await Category.deleteOne({_id: id});
    return res.send({success: 'Delete category!'});
  } catch(e) {
    console.log(e);
    next(e);
  }
});


export default categoriesRouter;