const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req,res) =>{
    try {
        const {categoryName, categoryDescription} = req.body;
        if(!categoryName || !categoryDescription){
            return res.status(400).json({
                success:false,
                message:"ERROR: CategoryName/Description missing."
            })
        }
        const category = await Category.findOne({name:categoryName});
        if(category!==null){
            return res.status(400).json({
                success:false,
                message:"ERROR: category already exists."
            })
        }
        const newCategory = await Category.create({name:categoryName,description:categoryDescription});
        return res.status(200).json({
            success:true,
            message:"SUCCESS: Category added successfully."
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"ERROR: creating category.",
            errorMessage:error.message
        })
    }
}

exports.showAllCategory = async (req,res) => {
    try {
        const allCategories = await Category.find({},{name:true,description:true});

        return res.status(200).json({
            success:true,
            message:"Categories retrieved and sent successfully.",
            categories:allCategories
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"ERROR: fetching Categories."
        })
    }
}

exports.categoryPageDetails =async (req,res)=>{
    try {
        
        const {categoryId} = req.body;
        
        const selectedCategory = await Category.find({_id:categoryId}).populate("course").exec();
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"ERROR: No courses found for this category."
            })
        }
        //to suggest courses of different cagtegories, we will find courses with categories different than this one
        const differentCategory = await Category.find({_id:{$ne:categoryId}}).populate("course").exec();
        
        // const topSellingCourses = await Course.find({}).sort({studentsEnrolled:"desc"}).populate("courseName");

        const topSellingCourses = await Course.aggregate([
            {
                $match:{category:categoryId}
            },
            { $addFields: { "length": { $size: "$studentsEnrolled" } } },
            { $sort: { "length": -1 } }
          ]);
        // aggregate([
        //     { $addFields: { "length": { $size: "$studentsEnrolled" } } },
        //     { $sort: { "length": -1 } }
        //   ]
        return res.status(200).json({
            success:true,
            message:"Category page retrieved and sent successfully.",
            data:{
                selectedCategory,
                differentCategory,
                topSellingCourses
            }
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"ERROR: fetching Category page details."
        })
    }
}